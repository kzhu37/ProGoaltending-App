"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, CreditCard, MapPin, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
import { OttawaMap } from "./ottawa-map";
import { PageHeader } from "@/components/ui/page-header";
import { Sheet } from "@/components/ui/sheet";
import { formatDate, formatTime } from "@/domain/dates";
import { recommendSessionType } from "@/domain/recommendation";
import type { Facility, Region } from "@/domain/types";
import { analytics } from "@/services/analytics";
import { demoAvailabilityService } from "@/services/availability";
import { mockPaymentGateway, type PaymentMethod } from "@/services/payment";
import { useAppStore } from "@/store/app-store";

const stepLabels = ["Training", "Location", "Date", "Time", "Coach", "Summary", "Checkout"];
const regions: (Region | "all")[] = ["all", "west", "central", "south", "east"];

export function BookingScreen() {
  const state = useAppStore();
  const setDraft = useAppStore((item) => item.setBookingDraft);
  const resetDraft = useAppStore((item) => item.resetBookingDraft);
  const completeBooking = useAppStore((item) => item.completeBooking);
  const draft = state.bookingDraft;
  const [region, setRegion] = useState<Region | "all">("all");
  const [facilitySheet, setFacilitySheet] = useState<Facility>();
  const [processing, setProcessing] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const recommendation = recommendSessionType(state.focuses, state.sessionTypes);
  const selectedType = state.sessionTypes.find((item) => item.id === draft.sessionTypeId);
  const selectedFacility = state.facilities.find((item) => item.id === draft.facilityId);
  const selectedCoach = state.coaches.find((item) => item.id === draft.coachId);
  const dates = demoAvailabilityService.listDates(state, 10);

  useEffect(() => {
    analytics.track("booking_started");
    if (draft.sessionTypeId) return;
    const requestedType = new URLSearchParams(window.location.search).get("type");
    if (requestedType && state.sessionTypes.some((item) => item.id === requestedType)) setDraft({ sessionTypeId: requestedType });
  }, [draft.sessionTypeId, setDraft, state.sessionTypes]);

  const timeOptions = useMemo(() => {
    if (!draft.facilityId || !draft.sessionTypeId || !draft.dateKey) return [];
    return demoAvailabilityService.listTimes(state, { facilityId: draft.facilityId, sessionTypeId: draft.sessionTypeId, dateKey: draft.dateKey });
  }, [draft.dateKey, draft.facilityId, draft.sessionTypeId, state]);
  const selectedSlot = timeOptions.find((item) => item.id === draft.slotId);
  const coachOptions = selectedSlot ? demoAvailabilityService.listCoaches(state, selectedSlot) : [];
  const completedSession = state.sessions.find((item) => item.id === draft.completedSessionId);

  const goTo = (step: number) => setDraft({ step });
  const selectType = (id: string) => setDraft({ sessionTypeId: id, facilityId: undefined, dateKey: undefined, slotId: undefined, coachId: undefined, step: 1 });
  const selectFacility = (facility: Facility) => {
    setFacilitySheet(facility);
    setDraft({ facilityId: facility.id, dateKey: undefined, slotId: undefined, coachId: undefined });
  };
  const continueFacility = () => { setFacilitySheet(undefined); goTo(2); };

  const pay = async () => {
    if (!selectedType || !selectedSlot || !draft.coachId || !draft.paymentMethod) return;
    setProcessing(true);
    setAvailabilityError(false);
    const latestSlots = demoAvailabilityService.listTimes(useAppStore.getState(), { facilityId: draft.facilityId!, sessionTypeId: draft.sessionTypeId!, dateKey: draft.dateKey! });
    if (!latestSlots.some((slot) => slot.id === selectedSlot.id)) {
      setAvailabilityError(true);
      setProcessing(false);
      return;
    }
    const result = await mockPaymentGateway.createPayment({ amount: selectedType.demoPrice, currency: "CAD", method: draft.paymentMethod, reference: selectedSlot.id });
    if (result.success) {
      completeBooking(selectedSlot, draft.coachId);
      analytics.track("booking_completed", { sessionType: selectedType.id, demoPrice: selectedType.demoPrice });
    }
    setProcessing(false);
  };

  if (draft.step === 7 && completedSession) {
    const type = state.sessionTypes.find((item) => item.id === completedSession.sessionTypeId)!;
    const facility = state.facilities.find((item) => item.id === completedSession.facilityId)!;
    return (
      <main className="page booking-page booking-success-page">
        <section className="booking-success">
          <div className="success-crease" aria-hidden="true"><i /><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .45, type: "spring" }}><Check size={34} /></motion.span></div>
          <p className="eyebrow">Booking confirmed</p><h1>You&apos;re booked.</h1>
          <p>Your next step is already connected to your Blueprint.</p>
          <div className="success-ticket"><span>{formatDate(completedSession.startAt, { weekday: "short", day: "2-digit", month: "short" })}</span><div><h2>{type.title}</h2><p>{formatTime(completedSession.startAt)} · {facility.name}</p></div><small>Demo</small></div>
          <Link className="button primary wide" href={`/training/${completedSession.id}`}>View session <ArrowRight size={18} /></Link>
          <Link className="button quiet wide" href="/" onClick={() => resetDraft()}>Done</Link>
          <p className="demo-disclosure">Demo booking only. No payment was processed.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page booking-page">
      <PageHeader back overline="Book training" title={stepLabels[draft.step] ?? "Book training"} />
      <div className="booking-progress" aria-label={`Step ${draft.step + 1} of ${stepLabels.length}`}><span style={{ width: `${((draft.step + 1) / stepLabels.length) * 100}%` }} /></div>
      <div className="booking-step-meta"><span>0{draft.step + 1}</span><p>{stepLabels[draft.step]}</p><small>{draft.step + 1} / {stepLabels.length}</small></div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div className="booking-step" key={draft.step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: .22 }}>
          {draft.step === 0 ? (
            <>
              <button className="smart-recommendation" onClick={() => selectType(recommendation.id)}>
                <div className="recommendation-top"><span><Sparkles size={15} /> Recommended for your Blueprint</span><small>Best fit</small></div>
                <h2>{recommendation.title}</h2><p>Supports {state.focuses.filter((focus) => ["primary", "building"].includes(focus.status)).slice(0, 2).map((focus) => focus.title).join(" + ")}.</p>
                <span className="recommendation-action">View times <ArrowRight size={17} /></span>
                <div className="recommendation-geometry" aria-hidden="true" />
              </button>
              <div className="section-heading booking-browse-heading"><div><p className="eyebrow">Browse all training</p><h2>Choose a format</h2></div><span>Demo pricing</span></div>
              <div className="training-type-list">{state.sessionTypes.map((type, typeIndex) => <button className={`training-type-${type.id}`} key={type.id} onClick={() => selectType(type.id)}><div className="type-number">0{typeIndex + 1}</div><div><h3>{type.title}</h3><p>{type.description}</p><span>{type.durationMinutes} min · Demo ${type.demoPrice}</span></div><ChevronRight size={20} /></button>)}</div>
            </>
          ) : null}

          {draft.step === 1 ? (
            <>
              <div className="scroll-filters region-filters" role="group" aria-label="Filter facilities by region">{regions.map((item) => <button key={item} className={region === item ? "active" : ""} onClick={() => setRegion(item)}>{item}</button>)}</div>
              <OttawaMap facilities={state.facilities} selectedId={draft.facilityId} region={region} onSelect={selectFacility} />
              <div className="facility-list"><div className="section-heading"><p className="eyebrow">Demo locations</p><span>{state.facilities.filter((item) => region === "all" || item.region === region).length} shown</span></div>{state.facilities.filter((item) => region === "all" || item.region === region).map((facility) => <button key={facility.id} className={draft.facilityId === facility.id ? "active" : ""} onClick={() => selectFacility(facility)}><span className="facility-index">{state.facilities.indexOf(facility) + 1}</span><div><strong>{facility.name}</strong><small>{facility.areaLabel} · {3 + state.facilities.indexOf(facility) % 4} demo times</small></div><ChevronRight size={19} /></button>)}</div>
            </>
          ) : null}

          {draft.step === 2 ? (
            <><div className="booking-context"><CalendarDays size={18} /><div><span>{selectedType?.title}</span><strong>{selectedFacility?.name}</strong></div><button onClick={() => goTo(1)}>Change</button></div><p className="field-label">Choose a demo date</p><div className="booking-date-list">{dates.map((date) => <button key={date.key} className={draft.dateKey === date.key ? "active" : ""} onClick={() => setDraft({ dateKey: date.key, slotId: undefined, coachId: undefined })}><div><span>{formatDate(date.iso, { weekday: "short" })}</span><strong>{formatDate(date.iso, { day: "2-digit" })}</strong></div><p>{formatDate(date.iso, { month: "long" })}</p><small>{date.availableCount} times</small>{draft.dateKey === date.key ? <Check size={18} /> : <ChevronRight size={18} />}</button>)}</div><button className="button primary wide sticky-step-action" disabled={!draft.dateKey} onClick={() => goTo(3)}>View available times <ArrowRight size={18} /></button></>
          ) : null}

          {draft.step === 3 ? (
            <><div className="booking-context"><Clock3 size={18} /><div><span>{selectedFacility?.name}</span><strong>{dates.find((item) => item.key === draft.dateKey) ? formatDate(dates.find((item) => item.key === draft.dateKey)!.iso, { weekday: "long", month: "long", day: "numeric" }) : "Selected date"}</strong></div><button onClick={() => goTo(2)}>Change</button></div><p className="field-label">Available times</p><div className="time-grid booking-times">{timeOptions.map((slot) => <button key={slot.id} className={draft.slotId === slot.id ? "active" : ""} onClick={() => setDraft({ slotId: slot.id, coachId: undefined })}><strong>{slot.label}</strong><span>{selectedType?.id === "small-group" ? `Small group · ${slot.remainingSpots} spots` : slot.remainingSpots === 1 ? "1 demo spot" : `${slot.remainingSpots} spots`}</span>{draft.slotId === slot.id ? <Check size={17} /> : null}</button>)}</div>{timeOptions.length === 0 ? <div className="service-error"><Clock3 size={20} /><h3>We couldn&apos;t load availability.</h3><p>Choose another date to continue.</p><button className="button secondary" onClick={() => goTo(2)}>Choose another date</button></div> : null}<button className="button primary wide sticky-step-action" disabled={!draft.slotId} onClick={() => goTo(4)}>Choose coach <ArrowRight size={18} /></button></>
          ) : null}

          {draft.step === 4 ? (
            <><div className="booking-context"><UserRound size={18} /><div><span>{selectedSlot?.label}</span><strong>Available demo coaches</strong></div><button onClick={() => goTo(3)}>Change</button></div><p className="field-label">Select a coach</p><div className="coach-grid">{coachOptions.map((coach) => <button key={coach.id} className={draft.coachId === coach.id ? "active" : ""} onClick={() => setDraft({ coachId: coach.id })}><span>{coach.displayName.replace("Coach ", "")}</span><div><strong>{coach.displayName}</strong><small>{coach.focusLabel}</small><i>Available</i></div>{draft.coachId === coach.id ? <Check size={17} /> : null}</button>)}</div><p className="selection-note">Coach identifiers are fictional and represent a scheduling variable only.</p><button className="button primary wide sticky-step-action" disabled={!draft.coachId} onClick={() => goTo(5)}>Review session <ArrowRight size={18} /></button></>
          ) : null}

          {draft.step === 5 && selectedType && selectedFacility && selectedSlot && selectedCoach ? (
            <><div className="booking-summary-card"><div className="summary-crease" aria-hidden="true" /><p className="eyebrow">Demo session summary</p><h2>{selectedType.title}</h2><div className="summary-date"><strong>{formatDate(selectedSlot.startAt, { weekday: "long", day: "2-digit", month: "short" })}</strong><span>{formatTime(selectedSlot.startAt)} · {selectedType.durationMinutes} minutes</span></div><dl><div><dt><MapPin size={16} /> Location</dt><dd>{selectedFacility.name}<small>{selectedFacility.areaLabel}</small></dd></div><div><dt><UserRound size={16} /> Coach</dt><dd>{selectedCoach.displayName}<small>{selectedCoach.focusLabel}</small></dd></div><div><dt><WalletCards size={16} /> Demo price</dt><dd>${selectedType.demoPrice} CAD<small>Fictional pricing</small></dd></div></dl></div><div className="summary-edit-row"><button onClick={() => goTo(0)}>Training</button><button onClick={() => goTo(1)}>Location</button><button onClick={() => goTo(2)}>Date</button><button onClick={() => goTo(3)}>Time</button><button onClick={() => goTo(4)}>Coach</button></div><button className="button primary wide" onClick={() => goTo(6)}>Continue to demo checkout <ArrowRight size={18} /></button></>
          ) : null}

          {draft.step === 6 && selectedType && selectedFacility && selectedSlot ? (
            <><div className="checkout-total"><div><span>Demo total</span><strong>${selectedType.demoPrice}<small> CAD</small></strong></div><p>{selectedType.title}<br />{formatDate(selectedSlot.startAt, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(selectedSlot.startAt)}</p></div><div className="demo-checkout-note"><ShieldCheck size={20} /><div><strong>Demo checkout</strong><p>No payment will be processed. Do not enter real financial information.</p></div></div><p className="field-label">Choose a simulated method</p><div className="payment-methods">{([{ id: "card", label: "Demo Card", icon: CreditCard }, { id: "apple", label: "Apple Pay", icon: WalletCards }, { id: "google", label: "Google Pay", icon: WalletCards }, { id: "credit", label: "Training Credit", icon: Sparkles }] as const).map((method) => { const Icon = method.icon; return <button key={method.id} className={draft.paymentMethod === method.id ? "active" : ""} onClick={() => setDraft({ paymentMethod: method.id as PaymentMethod })}><Icon size={19} /><span>{method.label}</span>{draft.paymentMethod === method.id ? <Check size={17} /> : <i />}</button>; })}</div>{draft.paymentMethod === "card" ? <div className="demo-card-placeholder"><CreditCard size={20} /><div><strong>No card details required</strong><p>The mock gateway will return a safe local success response.</p></div></div> : null}{availabilityError ? <div className="service-error compact-error"><Clock3 size={20} /><div><h3>That demo time is no longer available.</h3><p>Choose another time to continue.</p></div><button onClick={() => goTo(3)}>Choose another</button></div> : null}<button className="button primary wide checkout-button" disabled={!draft.paymentMethod || processing} onClick={() => void pay()}>{processing ? <><span className="button-loader" /> Completing demo booking</> : <>Complete demo booking <ArrowRight size={18} /></>}</button><button className="button quiet wide" onClick={() => goTo(5)}><ArrowLeft size={17} /> Back to summary</button></>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <Sheet open={Boolean(facilitySheet)} onClose={() => setFacilitySheet(undefined)} title="Demo facility" compact>
        {facilitySheet ? <div className="facility-sheet"><div className="facility-sheet-pin"><MapPin size={22} /></div><p className="eyebrow">{facilitySheet.areaLabel}</p><h3>{facilitySheet.name}</h3><p>{3 + state.facilities.indexOf(facilitySheet) % 4} fictional sessions available</p><div className="preview-times"><span>Tomorrow <strong>4:30 PM</strong></span><span>Saturday <strong>9:30 AM</strong></span><span>Sunday <strong>11:00 AM</strong></span></div><button className="button primary wide" onClick={continueFacility}>View availability <ArrowRight size={17} /></button><small>Location presence does not imply current PRO programming.</small></div> : null}
      </Sheet>
    </main>
  );
}
