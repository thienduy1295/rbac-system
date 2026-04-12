"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { signInSchema, SignInInput } from "@/schemas/auth.schema";
import { signInAction } from "@/actions/auth.action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function SignInPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: SignInInput) => {
    startTransition(async () => {
      const result = await signInAction(data);

      if (!result.success) {
        // Lỗi từ server → hiện dưới field tương ứng
        if (result.field === "email") {
          form.setError("email", { message: result.message });
        } else if (result.field === "password") {
          form.setError("password", { message: result.message });
        } else {
          // Lỗi chung (server error) → toast
          toast.error(result.message);
        }
        return;
      }

      toast.success("Đăng nhập thành công!");
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px),
                              linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-600 opacity-20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">
            RBAC System
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <p className="text-2xl font-light text-white leading-snug tracking-tight">
              Phân quyền thông minh,
              <br />
              <span className="text-indigo-400">kiểm soát toàn diện.</span>
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Hệ thống phân cấp quyền truy cập linh hoạt, giúp quản trị tổ chức
              dễ dàng và bảo mật.
            </p>
          </div>
          <div className="flex gap-8 pt-4 border-t border-zinc-800">
            {[
              { label: "Roles", value: "∞" },
              { label: "Groups", value: "N cấp" },
              { label: "Permissions", value: "Chi tiết" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-white font-semibold text-lg">{s.value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Đăng nhập
            </h1>
            <p className="text-sm text-muted-foreground">
              Nhập thông tin tài khoản để tiếp tục
            </p>
          </div>

          {/* Form — dùng shadcn Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@company.com"
                        autoComplete="email"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage /> {/* Tự hiện lỗi Zod + setError */}
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Mật khẩu</FormLabel>
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isPending}
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn size={15} />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-xs text-muted-foreground">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <span className="underline underline-offset-2 cursor-pointer hover:text-foreground transition-colors">
              Điều khoản sử dụng
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
