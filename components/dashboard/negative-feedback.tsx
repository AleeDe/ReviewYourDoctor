import { Mail, Phone, PartyPopper } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Submission } from "@/lib/types";

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{label}</span>
      <span className="text-right text-foreground">{value || "-"}</span>
    </div>
  );
}

/**
 * The action centre of the dashboard: unhappy patients to call/email.
 * One-tap Call/Email (KLM), large targets (Fitts), newest first (recency).
 */
export function NegativeFeedback({ negatives }: { negatives: Submission[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-base">Reach out & resolve</CardTitle>
          <CardDescription>
            Patients who rated 1-3★. Contact them privately.
          </CardDescription>
        </div>
        {negatives.length > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {negatives.length} to action
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {negatives.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <PartyPopper className="size-8 text-emerald-500" />
            <p className="text-sm font-medium">All caught up</p>
            <p className="text-sm text-muted-foreground">
              No negative feedback to follow up.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <ul className="space-y-3 sm:hidden">
              {negatives.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border bg-background p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-600">
                      {s.star_rating}★
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {s.reason && (
                    <p className="mt-2 rounded-lg bg-muted/60 p-2 text-sm text-foreground">
                      &ldquo;{s.reason}&rdquo;
                    </p>
                  )}
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <Detail label="Name" value={s.name} />
                    <Detail label="Email" value={s.email} />
                    <Detail label="Phone" value={s.phone} />
                  </div>
                  {(s.phone || s.email) && (
                    <div className="mt-3 flex gap-2">
                      {s.phone && (
                        <a
                          href={`tel:${s.phone}`}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-sm font-medium text-white"
                        >
                          <Phone className="size-4" /> Call
                        </a>
                      )}
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border text-sm font-medium"
                        >
                          <Mail className="size-4" /> Email
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Reach out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {negatives.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(s.created_at).toLocaleDateString("en-GB")}
                      </TableCell>
                      <TableCell className="font-medium text-amber-600">
                        {s.star_rating}★
                      </TableCell>
                      <TableCell
                        className="max-w-[240px] truncate"
                        title={s.reason ?? ""}
                      >
                        {s.reason || "-"}
                      </TableCell>
                      <TableCell>{s.name || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.email || s.phone || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {s.phone && (
                            <a
                              href={`tel:${s.phone}`}
                              aria-label="Call patient"
                              className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                              <Phone className="size-4" />
                            </a>
                          )}
                          {s.email && (
                            <a
                              href={`mailto:${s.email}`}
                              aria-label="Email patient"
                              className="grid size-9 place-items-center rounded-lg border transition-colors hover:bg-muted"
                            >
                              <Mail className="size-4" />
                            </a>
                          )}
                          {!s.phone && !s.email && (
                            <span className="text-xs text-muted-foreground">
                              no contact
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
