import "server-only";

export interface LiveRating {
  rating: number | null;
  reviewCount: number | null;
}

/**
 * Fetches the live Google rating + review count for a place using the
 * Google Places API (Place Details, Place Details (New) endpoint).
 * Returns nulls if not configured or on any error — the dashboard degrades
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
