import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ExternalLink, Loader2, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Reveal } from '@/components/motion/Reveal'
import { site } from '@/content/site'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xblawgak'

// Same brand-mark map and fallback as Hero.tsx. The IA calls for "form and
// direct links" here, and these mirror Hero's icon+label treatment exactly
// rather than inventing a third style. Lucide's Mail glyph for the non-brand
// email link, react-icons for GitHub/LinkedIn brand marks, ExternalLink as
// the fallback for any future site.social entry this map doesn't recognize.
const SOCIAL_ICONS: Record<string, typeof FaGithub> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
}

type FormValues = {
  name: string
  email: string
  message: string
}

type FieldName = keyof FormValues

type FormErrors = Partial<Record<FieldName, string>>

const EMPTY_VALUES: FormValues = { name: '', email: '', message: '' }
const FIELD_ORDER: FieldName[] = ['name', 'email', 'message']
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'Please enter a valid email address.'
  if (!values.message.trim()) errors.message = 'Please enter a message.'
  return errors
}

// Contact is the site's closing CTA. Two kinds of failure, handled
// differently: an empty-field submit is caught client-side (errors render
// next to their field via aria-describedby, and focus jumps to the first
// invalid field so a keyboard/screen-reader user isn't left guessing);
// a submit that passes validation but fails at the network (Formspree
// returns non-ok, or fetch throws outright) is announced in a role="alert".
// Unlike the old Contact.jsx, which only preserved the message by accident,
// the typed values are always kept so a network blip never costs a
// visitor's message.
export function Contact() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef }

  // Spam honeypot. Deliberately a ref rather than form state: keeping it out
  // of FormValues means validate(), FIELD_ORDER and the focus management stay
  // untouched, and a bot filling it cannot trigger a re-render.
  const honeypotRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)

    const nextErrors = validate(values)
    setErrors(nextErrors)

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field])
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus()
      return
    }

    // A real person never sees this field, so anything in it means an
    // automated submission. Drop it here rather than relying on the form
    // service to filter it: this guard is ours and is verifiable. `_gotcha`
    // is still sent below as defence in depth, since Formspree treats that
    // name as a honeypot when it chooses to.
    //
    // Report success rather than an error. Telling a bot it was filtered
    // just teaches whoever wrote it to stop filling the field.
    if (honeypotRef.current?.value) {
      setValues(EMPTY_VALUES)
      setResult('success')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, _gotcha: '' }),
      })
      if (!res.ok) throw new Error('Form submission failed')
      setResult('success')
      setValues(EMPTY_VALUES)
    } catch {
      setResult('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Reveal
      as="section"
      id="contact"
      className="relative overflow-hidden border-t border-border py-16 md:py-24"
    >
      {/* Decorative dot grid. This section is mostly form and whitespace, and
          without it the page ends on a flat void. Radially masked in
          theme.css so it fades out rather than tiling to a hard edge, and
          purely presentational, so it is hidden from assistive technology
          and cannot receive pointer events. */}
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-5xl px-4 md:px-6">
        <Reveal.Item>
          <h2 className="font-heading text-3xl font-semibold text-foreground">Contact</h2>
        </Reveal.Item>

        <Reveal.Item>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            I&apos;m always interested in new opportunities, collaborations, or just a conversation
            about technology and development. Feel free to reach out.
          </p>
        </Reveal.Item>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          {/* The form is ONE Reveal.Item, never one per field. Staggering
              individual inputs animates elements a keyboard user may be
              tabbing toward, and moving a focus target is worse than not
              animating it. Same rule everywhere: no Reveal.Item wraps a
              single focusable element. */}
          <Reveal.Item>
            <form noValidate onSubmit={handleSubmit} className="max-w-xl space-y-5">
              {/* Honeypot. `hidden` keeps it out of the layout and out of the
                  accessibility tree; tabIndex -1 keeps it out of the keyboard
                  order. No label, because nothing human should ever reach it. */}
              <input
                ref={honeypotRef}
                type="text"
                name="_gotcha"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  name="name"
                  ref={nameRef}
                  value={values.name}
                  onChange={handleChange}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  ref={emailRef}
                  value={values.email}
                  onChange={handleChange}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  ref={messageRef}
                  value={values.message}
                  onChange={handleChange}
                  rows={5}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-sm text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
                {submitting ? 'Sending…' : 'Send message'}
              </Button>

              {result === 'success' && (
                <p role="status" aria-live="polite" className="text-sm text-foreground">
                  Thank you for your message! I&apos;ll get back to you soon.
                </p>
              )}
              {result === 'error' && (
                <p role="alert" className="text-sm text-destructive">
                  Something went wrong sending your message. Please try again, or{' '}
                  <a href={`mailto:${site.email}`} className="underline underline-offset-2">
                    email me directly at {site.email}
                  </a>
                  .
                </p>
              )}
            </form>
          </Reveal.Item>

          <Reveal.Item>
            <div className="flex flex-row flex-wrap gap-3 md:flex-col md:items-start">
              <Button asChild variant="outline" size="lg">
                <a href={`mailto:${site.email}`}>
                  <Mail aria-hidden="true" className="size-4" />
                  Email
                </a>
              </Button>

              {site.social.map((link) => {
                const Icon = SOCIAL_ICONS[link.label] ?? ExternalLink
                return (
                  <Button key={link.label} asChild variant="outline" size="lg">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <Icon aria-hidden="true" className="size-4" />
                      {link.label}
                    </a>
                  </Button>
                )
              })}
            </div>
          </Reveal.Item>
        </div>
      </div>
    </Reveal>
  )
}
