"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, type LoginState } from "@/app/login/actions";

const INITIAL: LoginState = { error: null };

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(login, INITIAL);
  const [visible, setVisible] = useState(false);

  /**
   * React 19 vacía el formulario cuando termina una server action. Con la
   * contraseña es lo deseable, pero borrar también el correo obliga a
   * reescribirlo cada vez que uno se equivoca de clave, así que este campo se
   * controla desde React para que sobreviva al reinicio.
   */
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          Correo
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@novatech.co"
          className="h-12"
        />
      </div>

      {/* El botón de ver/ocultar queda FUERA del <label>: dentro, su
          `aria-label` se concatenaría al nombre accesible del campo y el
          lector de pantalla anunciaría "Contraseña Mostrar contraseña". */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-12 pr-11"
          />
          <button
            type="button"
            onClick={() => setVisible((open) => !open)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-controls="password"
            className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full text-sm"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Entrando…
          </>
        ) : (
          "Entrar al panel"
        )}
      </Button>
    </form>
  );
}
