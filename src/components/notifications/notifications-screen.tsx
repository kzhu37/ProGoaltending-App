"use client";

import Link from "next/link";
import { Bell, CalendarCheck, CheckCheck, ChevronRight, ClipboardCheck, FilePlay, Layers3, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { humanTimeAgo } from "@/domain/dates";
import type { NotificationType } from "@/domain/types";
import { useAppStore } from "@/store/app-store";

const icons: Record<NotificationType, typeof Bell> = {
  booking: CalendarCheck,
  training: Bell,
  blueprint: Layers3,
  resource: FilePlay,
  recap: ClipboardCheck,
  system: Bell,
};

export function NotificationsScreen() {
  const state = useAppStore();
  const markRead = useAppStore((item) => item.markNotificationRead);
  const markAll = useAppStore((item) => item.markAllNotificationsRead);
  const dismiss = useAppStore((item) => item.dismissNotification);
  const unread = state.notifications.filter((item) => !item.read).length;
  return (
    <main className="page notifications-page">
      <PageHeader back overline="Activity" title="Notifications"><button className="header-text-action" onClick={markAll} disabled={unread === 0}><CheckCheck size={17} /> Mark all read</button></PageHeader>
      <div className="notification-summary"><div><strong>{unread.toString().padStart(2, "0")}</strong><span>Unread</span></div><p>Training, Blueprint, and review updates stay connected here.</p></div>
      {state.notifications.length ? <div className="notification-list">{state.notifications.map((notification) => { const Icon = icons[notification.type]; const content = <><span className={`notification-icon type-${notification.type}`}><Icon size={18} /></span><div><div className="notification-title"><strong>{notification.title}</strong><time>{humanTimeAgo(notification.createdAt, state.virtualNowISO)}</time></div><p>{notification.body}</p></div>{notification.href ? <ChevronRight size={18} /> : null}</>; return <div className={`notification-item ${notification.read ? "read" : "unread"}`} key={notification.id}>{notification.href ? <Link href={notification.href} onClick={() => markRead(notification.id)}>{content}</Link> : <button onClick={() => markRead(notification.id)}>{content}</button>}<button className="notification-dismiss" onClick={() => dismiss(notification.id)} aria-label={`Dismiss ${notification.title}`}><Trash2 size={16} /></button></div>; })}</div> : <div className="empty-state inline-empty"><Bell size={26} /><h2>You&apos;re all caught up.</h2><p>New development activity will appear here.</p></div>}
    </main>
  );
}
