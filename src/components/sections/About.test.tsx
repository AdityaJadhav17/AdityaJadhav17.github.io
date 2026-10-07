import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { About } from './About'
import { Footer } from '@/components/layout/Footer'

const GROUPS: Record<string, string[]> = {
  Languages: ['Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'C#', 'SQL', 'Bash', 'HTML/CSS'],
  'AI and ML': ['PyTorch', 'TensorFlow', 'NumPy', 'OpenCV', 'YOLOv8', 'LangGraph'],
  'Web, backend and desktop': ['React', 'Node.js', 'FastAPI', 'ASP.NET Core', 'Supabase', 'Qt'],
  Security: ['Nmap', 'OWASP'],
  'Tools and cloud': ['Git', 'Linux', 'Docker', 'AWS', 'IBM Cloud', 'Playwright'],
}

describe('About skills', () => {
  it('renders the five group labels with every item once, under its group', () => {
    render(<About />)
    for (const [group, items] of Object.entries(GROUPS)) {
      const heading = screen.getByRole('heading', { name: group })
      const list = heading.nextElementSibling as HTMLElement
      expect(Array.from(list.querySelectorAll('li')).map((li) => li.textContent)).toEqual(items)
    }
  })
})

describe('Footer', () => {
  it('has no "All rights reserved" line but keeps Back to top', () => {
    render(<Footer />)
    expect(screen.queryByText(/all rights reserved/i)).toBeNull()
    expect(screen.getByRole('button', { name: /back to top/i })).toBeTruthy()
  })
})
