'use client'

import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      '.service-row, .pricing-card, .card, .playbook-card, .tcard, .blog-card, .faq-item, .feature-block, .about__inner, .contact__inner, .cal-wrapper, .newsletter__inner, .clients-carousel'
    )

    const grids = ['.pricing-grid', '.work-grid', '.playbooks-grid', '.testimonials-grid']
    grids.forEach(sel => {
      document.querySelectorAll<HTMLElement>(`${sel} > *`).forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${i * 0.07}s`)
      })
    })

    targets.forEach(el => el.setAttribute('data-reveal', ''))

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )
    targets.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return null
}
