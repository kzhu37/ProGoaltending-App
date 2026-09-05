"use client";

import { ArrowLeft, Bell, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

type PageHeaderProps = {
  title?: string;
  overline?: string;
  back?: boolean;
  settings?: boolean;
  children?: React.ReactNode;
};

export function PageHeader({ title, overline, back = false, settings = false, children }: PageHeaderProps) {
  const router = useRouter();
  const unread = useAppStore((state) => state.notifications.filter((item) => !item.read).length);
  return (
    <header className="page-header">
      <div className="page-header-leading">
        {back ? (
          <button className="icon-button" onClick={() => router.back()} aria-label="Go back"><ArrowLeft size={20} /></button>
        ) : (
          <Link href="/" className="wordmark" aria-label="PRO Goaltending home"><Image src="/brand/pro-goaltending-logo.png" alt="PRO Goaltending" width={112} height={37} priority /></Link>
        )}
        {title ? <div><span className="header-overline">{overline}</span><h1>{title}</h1></div> : null}
      </div>
      <div className="page-header-actions">
        {children}
        {settings ? <Link className="icon-button" href="/settings" aria-label="Settings"><Settings size={19} /></Link> : null}
        {!back && !settings ? (
          <Link className="icon-button notification-button" href="/notifications" aria-label={`${unread} unread notifications`}>
            <Bell size={19} />{unread > 0 ? <span>{unread}</span> : null}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
