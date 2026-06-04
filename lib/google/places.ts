import "server-only";

export interface LiveRating {
  rating: number | null;
  reviewCount: number | null;
}

export interface PlaceCandidate {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number | null;
}

/** The "write a review" deep link Google opens for a place. */
export function reviewUrlForPlace(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${placeId}`;
}

export interface PlacePrediction {
  placeId: string;
  primary: string;
  secondary: string;
}

/**
 * Type-ahead place predictions via Places Autocomplete (New). Returns a real
 * error string (e.g. billing/API disabled) so the UI can show what went wrong.
 * Server-only.
 */
export async function autocompletePlaces(
  input: string,
): Promise<{ predictions: PlacePrediction[]; error: string | null }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey)
    return { predictions: [], error: "GOOGLE_PLACES_API_KEY is not set." };
  if (!input.trim()) return { predictions: [], error: null };

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
      body: JSON.stringify({ input }),
    });
    const data = (await res.json()) as {
      error?: { message?: string; status?: string };
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text?: { text?: string };
          structuredFormat?: {
            mainText?: { text?: string };
            secondaryText?: { text?: string };
          };
        };
      }>;
    };

    if (!res.ok) {
      return {
        predictions: [],
        error: data?.error?.message || `Google error (HTTP ${res.status}).`,
      };
    }

    const predictions = (data.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        placeId: p.placeId,
        primary: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondary: p.structuredFormat?.secondaryText?.text ?? "",
      }));

    return { predictions, error: null };
  } catch (e) {
    return {
      predictions: [],
      error: e instanceof Error ? e.message : "Request failed.",
    };
  }
}

/**
 * Resolves a free-text query (clinic name + town, or a pasted listing) to
 * Google place candidates via Places Text Search (New). Server-only.
 */
export async function searchPlaces(query: string): Promise<PlaceCandidate[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const q = query.trim();
  if (!apiKey || !q) return [];

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery: q, maxResultCount: 5 }),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      places?: Array<{
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        rating?: number;
        userRatingCount?: number;
      }>;
    };

    return (data.places ?? []).map((p) => ({
      placeId: p.id,
      name: p.displayName?.text ?? "Unknown",
      address: p.formattedAddress ?? "",
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetches the live Google rating + review count for a place using the
 * Google Places API (Place Details, Place Details (New) endpoint).
 * Returns nulls if not configured or on any error, so the dashboard degrades
 * gracefully rather than failing.
 *
 * Server-only: never call from a Client Component (uses the secret API key).
 */
export async function getLiveRating(
  placeId: string | null,
): Promise<LiveRating> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!placeId || !apiKey) {
    return { rating: null, reviewCount: null };
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount",
        },
        // Cache for 1 hour to stay well within free-tier quota.
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      return { rating: null, reviewCount: null };
    }

    const data = (await res.json()) as {
      rating?: number;
      userRatingCount?: number;
    };

    return {
      rating: data.rating ?? null,
      reviewCount: data.userRatingCount ?? null,
    };
  } catch {
    return { rating: null, reviewCount: null };
  }
}
