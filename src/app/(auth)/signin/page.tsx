"use client";

import { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { signInSchema, SignInInput } from "@/schemas/auth.schema";
import { signInAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { useLocale } from "@/contexts/locale-context";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const { dict } = useLocale();
  const t = dict.auth.signin;

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SignInInput) => {
    startTransition(async () => {
      const result = await signInAction(data);

      if (!result.success) {
        if (result.field === "email") {
          form.setError("email", { message: result.message });
        } else if (result.field === "password") {
          form.setError("password", { message: result.message });
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(t.successMessage);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="example@company.com"
                autoComplete="email"
                disabled={isPending}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>{t.password}</FieldLabel>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? dict.common.hidePassword : dict.common.showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              {dict.common.processing}
            </>
          ) : (
            <>
              <LogIn size={15} />
              {t.submit}
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t.noAccount}{" "}
        <Link
          href="/signup"
          className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          {t.register}
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        {t.terms}{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
          {t.termsLink}
        </span>
      </p>
    </>
  );
}
