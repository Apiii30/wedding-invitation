import { InvitationShell } from "@/components/invitation/shell";
import { RsvpForm } from "@/components/invitation/rsvp-form";
import {
  Closing,
  Couple,
  Events,
  GallerySection,
  GiftSection,
  Hero,
  LoveStorySection,
  Opening,
  RsvpSection,
} from "@/components/invitation/sections";
import { wedding } from "@/data/wedding";
import { isRsvpClosed } from "@/lib/deadline";
import { photo } from "@/lib/photos";
import { store } from "@/lib/store";

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function Page({ searchParams }: Props) {
  // ?to=budi-santoso  -> tamu terdaftar (nama rapi, jatah kursi, RSVP bisa diubah)
  // ?to=Budi Santoso  -> tamu umum (nama ditampilkan apa adanya)
  const raw = (await searchParams).to;
  const to = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 80) || null;

  const guest = to && /^[a-z0-9-]+$/.test(to) ? await store.findGuestBySlug(to) : null;
  const [existing, wishes] = await Promise.all([
    guest ? store.getRsvpByGuestId(guest.id) : null,
    store.listWishes(500),
  ]);

  const guestName = guest?.name ?? to;
  const closed = isRsvpClosed();

  return (
    <InvitationShell
      guestName={guestName}
      names={`${wedding.bride.nickname} & ${wedding.groom.nickname}`}
      cover={photo(wedding.photos.cover)}
      music={wedding.music}
      hasGifts={wedding.gifts.length > 0 || !!wedding.giftAddress}
    >
      <Hero />
      <Opening />
      <Couple />
      <LoveStorySection />
      <Events />
      <GallerySection />
      <RsvpSection
        wishes={wishes}
        form={
          <RsvpForm
            guest={guest && { slug: guest.slug, name: guest.name, maxPax: guest.maxPax }}
            defaultName={guest ? null : to}
            existing={existing && { attendance: existing.attendance, pax: existing.pax, message: existing.message }}
            publicMaxPax={wedding.publicMaxPax}
            closed={closed}
          />
        }
      />
      <GiftSection guestName={guestName} />
      <Closing />
    </InvitationShell>
  );
}
