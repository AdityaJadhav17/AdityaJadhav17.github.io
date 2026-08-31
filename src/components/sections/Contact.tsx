import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ExternalLink, Loader2, Mail } from 'lucide-react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'
import { site } from '@/content/site'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xblawgak'

// Same brand-mark map and fallback as Hero.tsx (RULING AJ) — the IA calls
// for "form and direct links" here, and these mirror Hero's icon+label
// treatment exactly rather than inventing a third style (see final-review
// finding 2). Lucide's Mail glyph for the non-brand email link, react-icons
// for GitHub/LinkedIn brand marks, ExternalLink as the fallback for any
// future site.social entry this map doesn't recognize.
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

// Contact — the site's closing CTA. Two kinds of failure, handled
// differently: an empty-field submit is caught client-side (errors render
// next to their field via aria-describedby, and focus jumps to the first
// invalid field so a keyboard/screen-reader user isn't left guessing);
// a submit that passes validation but fails at the network (Formspree
// returns non-ok, or fetch throws outright) is announced in a role="alert"
// and — unlike the old Contact.jsx, which only preserved the message by
// accident — the typed values are always kept so a network blip never
// costs a visitor's message.
export function Contact() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const fieldRefs = { name: nameRef, email: emailRef, message: messageRef }
  const { ref: sectionRef, revealed } = useScrollReveal<HTMLElement>()

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

    setSubmitting(true)
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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
    <section
      id="contact"
      ref={sectionRef}
      className={cn('reveal border-t border-border py-16 md:py-24', !revealed && 'reveal-hidden')}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <h2 className="font-heading text-3xl font-semibold text-foreground">Contact</h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          I&apos;m always interested in new opportunities, collaborations, or just a conversation
          about technology and development. Feel free to reach out.
        </p>

        <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[3fr_2fr]">
          <form noValidate onSubmit={handleSubmit} className="max-w-xl space-y-5">
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
        </div>
      </div>
    </section>
  )
}
