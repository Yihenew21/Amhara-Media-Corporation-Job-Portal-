import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import JobCard from '../JobCard'

const mockJob = {
  id: '1',
  title: 'Software Engineer',
  department: 'Technology',
  location: 'Addis Ababa',
  postedDate: '2024-01-15',
  expiryDate: '2024-02-15',
  description: 'A great job opportunity',
  requirements: ['React', 'TypeScript'],
  isActive: true,
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('JobCard', () => {
  it('renders job information correctly', () => {
    renderWithRouter(<JobCard {...mockJob} />)
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
    expect(screen.getByText('Addis Ababa')).toBeInTheDocument()
  })

  it('shows active status for active jobs', () => {
    renderWithRouter(<JobCard {...mockJob} />)
    
    const activebadge = screen.getByText('Active')
    expect(activebadge).toBeInTheDocument()
  })

  it('shows inactive status for inactive jobs', () => {
    const inactiveJob = { ...mockJob, isActive: false }
    renderWithRouter(<JobCard {...inactiveJob} />)
    
    const inactiveText = screen.queryByText('Active')
    expect(inactiveText).not.toBeInTheDocument()
  })

  it('displays requirements as badges', () => {
    renderWithRouter(<JobCard {...mockJob} />)
    
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
