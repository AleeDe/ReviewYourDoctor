"use client";

import { useActionState } from "react";
import { createClinic, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionState = { ok: false, message: "" };

export function CreateClinicForm() {
  const [state, formAction, pending] = useActionState(
    createClinic,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field name="clinic_name" label="Clinic name *" />
      <Field
        name="slug"
        label="Slug (URL)"
        placeholder="auto-generated from name"
      />
      <Field
        name="google_review_url"
        label="Google review URL"
        className="sm:col-span-2"
      />
      <Field name="manager_email" label="Manager alert email *" type="email" />
      <Field name="google_place_id" label="Google Place ID" />
      <div className="sm:col-span-2">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Dashboard login for the clinic
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="owner_email" label="Login email *" type="email" />
          <Field
            name="owner_password"
            label="Temporary password *"
            type="text"
          />
        </div>
      </div>

      {state.message && (
        <p
          className={`sm:col-span-2 text-sm ${
            state.ok ? "text-green-600" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create clinic"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} placeholder={placeholder} />
    </div>
  );
}
