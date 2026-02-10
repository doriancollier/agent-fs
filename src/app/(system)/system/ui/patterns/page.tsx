'use client'

import * as React from 'react'
import { Inbox, Search, ArrowUpDown, MoreHorizontal, Loader2 } from 'lucide-react'
import { ComponentSection } from '../_components/ComponentSection'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuPositioner, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

// Sample data for table
const tableData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', role: 'Admin', amount: '$2,500.00' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', role: 'User', amount: '$1,250.00' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', status: 'Active', role: 'User', amount: '$3,100.00' },
  { id: 4, name: 'David Brown', email: 'david@example.com', status: 'Inactive', role: 'User', amount: '$890.00' },
  { id: 5, name: 'Eva Martinez', email: 'eva@example.com', status: 'Active', role: 'Moderator', amount: '$1,750.00' },
]

export default function PatternsPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
    }, 2000)
  }

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      setFormErrors(prev => ({ ...prev, [name]: 'This field is required' }))
    } else {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patterns</h1>
        <p className="mt-2 text-muted-foreground">
          Common UI compositions demonstrating how to combine components for real-world use cases.
        </p>
      </div>

      {/* Data Table Pattern */}
      <ComponentSection
        id="data-table"
        title="Data Table"
        description="Table with search, sortable headers, row actions, and pagination."
      >
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Add User</Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="-ml-3 h-8">
                      Name <ArrowUpDown className="ml-2 size-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === 'Active' ? 'default' :
                          row.status === 'Pending' ? 'secondary' : 'outline'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell className="text-right">{row.amount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuPositioner align="end">
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenuPositioner>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1-5 of 42 results
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Empty State Example */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-3">Empty State (when no results)</h4>
            <div className="rounded-lg border p-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No results found</EmptyTitle>
                  <EmptyDescription>Try adjusting your search or filter to find what you&apos;re looking for.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm">Clear filters</Button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Form Pattern */}
      <ComponentSection
        id="form-pattern"
        title="Form Pattern"
        description="Complete form with validation, different input types, and submit states."
      >
        <form onSubmit={handleDemoSubmit} className="max-w-lg space-y-6">
          {/* Text Inputs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                aria-invalid={!!formErrors.firstName}
                onBlur={(e) => validateField('firstName', e.target.value)}
              />
              {formErrors.firstName && (
                <p className="text-sm text-destructive">{formErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                aria-invalid={!!formErrors.lastName}
                onBlur={(e) => validateField('lastName', e.target.value)}
              />
              {formErrors.lastName && (
                <p className="text-sm text-destructive">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
            />
            <p className="text-sm text-muted-foreground">
              We&apos;ll never share your email with anyone else.
            </p>
          </div>

          {/* Select */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us what you're thinking..."
              rows={4}
            />
          </div>

          {/* Radio Group */}
          <div className="space-y-2">
            <Label>Notification Preference</Label>
            <RadioGroup defaultValue="email">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="email" id="notify-email" />
                <Label htmlFor="notify-email" className="font-normal">Email</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sms" id="notify-sms" />
                <Label htmlFor="notify-sms" className="font-normal">SMS</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="none" id="notify-none" />
                <Label htmlFor="notify-none" className="font-normal">No notifications</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-2">
            <Checkbox id="terms" className="mt-1" />
            <div>
              <Label htmlFor="terms" className="font-normal">
                I agree to the terms and conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </ComponentSection>

      {/* Card Layouts */}
      <ComponentSection
        id="card-layouts"
        title="Card Layouts"
        description="Different card arrangements and variations."
      >
        <div className="space-y-8">
          {/* 3 Column Grid */}
          <div>
            <h4 className="text-sm font-medium mb-3">3 Column Grid</h4>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Card {i}</CardTitle>
                    <CardDescription>A brief description of this card.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Card content goes here. This could be any type of content.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm" variant="outline">Learn More</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Interactive Cards */}
          <div>
            <h4 className="text-sm font-medium mb-3">Interactive Cards (Hover Effect)</h4>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {['Documents', 'Images', 'Videos', 'Music'].map((type) => (
                <Card key={type} className="card-interactive cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">42</p>
                    <p className="text-xs text-muted-foreground">files</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Card with Stats */}
          <div>
            <h4 className="text-sm font-medium mb-3">Stat Cards</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-2xl">$45,231.89</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+20.1%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Subscriptions</CardDescription>
                  <CardTitle className="text-2xl">+2,350</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+180.1%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Sales</CardDescription>
                  <CardTitle className="text-2xl">+12,234</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+19%</span> from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Now</CardDescription>
                  <CardTitle className="text-2xl">+573</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-success">+201</span> since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Empty States */}
      <ComponentSection
        id="empty-states"
        title="Empty States"
        description="Placeholder content when no data is available."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Simple Empty */}
          <Card>
            <CardContent className="py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox />
                  </EmptyMedia>
                  <EmptyTitle>No messages</EmptyTitle>
                  <EmptyDescription>You don&apos;t have any messages yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>

          {/* Empty with Action */}
          <Card>
            <CardContent className="py-12">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox />
                  </EmptyMedia>
                  <EmptyTitle>No projects</EmptyTitle>
                  <EmptyDescription>Get started by creating a new project.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button>Create Project</Button>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        </div>
      </ComponentSection>

      {/* Loading States */}
      <ComponentSection
        id="loading-states"
        title="Loading States"
        description="Skeleton loaders and spinners for content placeholders."
      >
        <div className="space-y-8">
          {/* Card Skeleton */}
          <div>
            <h4 className="text-sm font-medium mb-3">Card Skeleton</h4>
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* List Skeleton */}
          <div>
            <h4 className="text-sm font-medium mb-3">List Skeleton</h4>
            <div className="max-w-md space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Skeleton */}
          <div>
            <h4 className="text-sm font-medium mb-3">Table Skeleton</h4>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Button Loading */}
          <div>
            <h4 className="text-sm font-medium mb-3">Button Loading States</h4>
            <div className="flex flex-wrap gap-4">
              <Button disabled>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </Button>
              <Button variant="outline" disabled>
                <Spinner className="size-3" />
                Processing
              </Button>
              <Button variant="secondary" disabled>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </Button>
            </div>
          </div>

          {/* Page Loading */}
          <div>
            <h4 className="text-sm font-medium mb-3">Centered Loading</h4>
            <div className="h-48 rounded-lg border flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="size-6" />
                <p className="text-sm text-muted-foreground">Loading content...</p>
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>
    </div>
  )
}
