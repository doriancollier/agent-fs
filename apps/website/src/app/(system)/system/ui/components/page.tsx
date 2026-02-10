'use client'

import * as React from 'react'
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Plus, Minus, Search, User, Settings, Mail, Bell, Calendar,
  ChevronRight, ChevronDown, MoreHorizontal, Check, X, Loader2,
  Home, FileText, Image, Info, AlertTriangle, AlertCircle, CheckCircle,
  Copy, Trash, Edit, Share, Download, Upload, ExternalLink
} from 'lucide-react'
import { ComponentSection } from '../_components/ComponentSection'
import { ComponentGrid, Demo } from '../_components/ComponentGrid'

// Actions
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Forms
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

// Feedback
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'

// Overlay
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'

// Navigation
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination'

// Data Display
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Kbd } from '@/components/ui/kbd'

// Layout
import { ScrollArea } from '@/components/ui/scroll-area'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'

export default function ComponentsPage() {
  const [sliderValue, setSliderValue] = React.useState([50])
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(false)

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Components</h1>
        <p className="mt-2 text-muted-foreground">
          53 UI components organized by category. Click interactive components to see their behavior.
        </p>
      </div>

      {/* Actions */}
      <ComponentSection
        id="actions"
        title="Actions"
        description="Buttons, toggles, and interactive controls for user actions."
      >
        <div className="space-y-8">
          {/* Button Variants */}
          <div>
            <h4 className="text-sm font-medium mb-3">Button Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div>
            <h4 className="text-sm font-medium mb-3">Button Sizes</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon"><Plus className="size-4" /></Button>
              <Button size="icon-sm"><Plus className="size-4" /></Button>
              <Button size="icon-lg"><Plus className="size-4" /></Button>
            </div>
          </div>

          {/* Button with Icons */}
          <div>
            <h4 className="text-sm font-medium mb-3">Button with Icons</h4>
            <div className="flex flex-wrap gap-2">
              <Button><Mail className="size-4" /> Login with Email</Button>
              <Button variant="outline"><Download className="size-4" /> Download</Button>
              <Button variant="secondary">Next <ChevronRight className="size-4" /></Button>
              <Button disabled><Loader2 className="size-4 animate-spin" /> Loading</Button>
            </div>
          </div>

          {/* ButtonGroup */}
          <div>
            <h4 className="text-sm font-medium mb-3">Button Group</h4>
            <ButtonGroup>
              <Button variant="outline">Left</Button>
              <Button variant="outline">Center</Button>
              <Button variant="outline">Right</Button>
            </ButtonGroup>
          </div>

          {/* Toggle */}
          <div>
            <h4 className="text-sm font-medium mb-3">Toggle</h4>
            <div className="flex gap-2">
              <Toggle aria-label="Toggle bold">
                <Bold className="size-4" />
              </Toggle>
              <Toggle aria-label="Toggle italic">
                <Italic className="size-4" />
              </Toggle>
              <Toggle variant="outline" aria-label="Toggle underline">
                <Underline className="size-4" />
              </Toggle>
            </div>
          </div>

          {/* ToggleGroup */}
          <div>
            <h4 className="text-sm font-medium mb-3">Toggle Group</h4>
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-muted-foreground block mb-2">Single Selection</span>
                <ToggleGroup defaultValue={["center"]}>
                  <ToggleGroupItem value="left" aria-label="Align left">
                    <AlignLeft className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">
                    <AlignCenter className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">
                    <AlignRight className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-2">Multiple Selection</span>
                <ToggleGroup multiple defaultValue={["bold"]}>
                  <ToggleGroupItem value="bold" aria-label="Bold">
                    <Bold className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="italic" aria-label="Italic">
                    <Italic className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="underline" aria-label="Underline">
                    <Underline className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Forms */}
      <ComponentSection
        id="forms"
        title="Forms"
        description="Input controls for collecting user data."
      >
        <div className="space-y-8 max-w-xl">
          {/* Input */}
          <div>
            <h4 className="text-sm font-medium mb-3">Input</h4>
            <div className="space-y-3">
              <Input placeholder="Default input" />
              <Input placeholder="Disabled input" disabled />
              <Input placeholder="With error" aria-invalid="true" />
              <Input type="password" placeholder="Password" />
            </div>
          </div>

          {/* Textarea */}
          <div>
            <h4 className="text-sm font-medium mb-3">Textarea</h4>
            <Textarea placeholder="Enter your message..." />
          </div>

          {/* Label */}
          <div>
            <h4 className="text-sm font-medium mb-3">Label + Input</h4>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" />
            </div>
          </div>

          {/* Select */}
          <div>
            <h4 className="text-sm font-medium mb-3">Select</h4>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="grape">Grape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox */}
          <div>
            <h4 className="text-sm font-medium mb-3">Checkbox</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="newsletter" defaultChecked />
                <Label htmlFor="newsletter">Subscribe to newsletter</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="disabled" disabled />
                <Label htmlFor="disabled" className="text-muted-foreground">Disabled option</Label>
              </div>
            </div>
          </div>

          {/* RadioGroup */}
          <div>
            <h4 className="text-sm font-medium mb-3">Radio Group</h4>
            <RadioGroup defaultValue="option-1">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-1" id="option-1" />
                <Label htmlFor="option-1">Option 1</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-2" id="option-2" />
                <Label htmlFor="option-2">Option 2</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="option-3" id="option-3" />
                <Label htmlFor="option-3">Option 3</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Switch */}
          <div>
            <h4 className="text-sm font-medium mb-3">Switch</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="notifications" defaultChecked />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
            </div>
          </div>

          {/* Slider */}
          <div>
            <h4 className="text-sm font-medium mb-3">Slider</h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Value: {sliderValue[0]}</span>
                <Slider
                  value={sliderValue}
                  onValueChange={(value) => setSliderValue(value as number[])}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Feedback */}
      <ComponentSection
        id="feedback"
        title="Feedback"
        description="Components for displaying status, progress, and loading states."
      >
        <div className="space-y-8">
          {/* Alert */}
          <div>
            <h4 className="text-sm font-medium mb-3">Alert</h4>
            <div className="space-y-3 max-w-xl">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Default Alert</AlertTitle>
                <AlertDescription>This is a default alert message.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Something went wrong. Please try again.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <CheckCircle className="size-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Your changes have been saved.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>This action cannot be undone.</AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h4 className="text-sm font-medium mb-3">Progress</h4>
            <div className="space-y-4 max-w-xl">
              <Progress value={25}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
              <Progress value={50}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
              <Progress value={75}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </div>
          </div>

          {/* Skeleton */}
          <div>
            <h4 className="text-sm font-medium mb-3">Skeleton</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
            </div>
          </div>

          {/* Spinner */}
          <div>
            <h4 className="text-sm font-medium mb-3">Spinner</h4>
            <div className="flex gap-4 items-center">
              <Spinner className="size-3" />
              <Spinner />
              <Spinner className="size-6" />
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Overlay */}
      <ComponentSection
        id="overlay"
        title="Overlay"
        description="Modal dialogs, sheets, popovers, and floating elements."
      >
        <div className="space-y-8">
          {/* Dialog */}
          <div>
            <h4 className="text-sm font-medium mb-3">Dialog</h4>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Open Dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Title</DialogTitle>
                  <DialogDescription>
                    This is a dialog description. You can put any content here.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">Dialog content goes here.</p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* AlertDialog */}
          <div>
            <h4 className="text-sm font-medium mb-3">Alert Dialog</h4>
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" />}>
                Delete Account
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Sheet */}
          <div>
            <h4 className="text-sm font-medium mb-3">Sheet</h4>
            <div className="flex flex-wrap gap-2">
              <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>
                  Right Sheet
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Sheet Title</SheetTitle>
                    <SheetDescription>Sheet description goes here.</SheetDescription>
                  </SheetHeader>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">Sheet content</p>
                  </div>
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>
                  Left Sheet
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Left Sheet</SheetTitle>
                    <SheetDescription>Opens from the left side.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Sheet>
                <SheetTrigger render={<Button variant="outline" />}>
                  Bottom Sheet
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Bottom Sheet</SheetTitle>
                    <SheetDescription>Opens from the bottom.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Popover */}
          <div>
            <h4 className="text-sm font-medium mb-3">Popover</h4>
            <Popover>
              <PopoverTrigger render={<Button variant="outline" />}>
                Open Popover
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tooltip */}
          <div>
            <h4 className="text-sm font-medium mb-3">Tooltip</h4>
            <div className="flex gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                    <Plus className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add item</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={<Button variant="outline" size="icon" />}>
                    <Settings className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* HoverCard */}
          <div>
            <h4 className="text-sm font-medium mb-3">Hover Card</h4>
            <HoverCard>
              <HoverCardTrigger render={<Button variant="link" />}>
                @username
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>UN</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">@username</h4>
                    <p className="text-sm text-muted-foreground">
                      Software developer and design enthusiast.
                    </p>
                    <div className="flex items-center pt-2">
                      <Calendar className="mr-2 size-4 opacity-70" />
                      <span className="text-xs text-muted-foreground">
                        Joined December 2021
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* DropdownMenu */}
          <div>
            <h4 className="text-sm font-medium mb-3">Dropdown Menu</h4>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                Open Menu <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ExternalLink className="size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ContextMenu */}
          <div>
            <h4 className="text-sm font-medium mb-3">Context Menu</h4>
            <ContextMenu>
              <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm">
                Right click here
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Copy className="size-4" /> Copy
                </ContextMenuItem>
                <ContextMenuItem>
                  <Edit className="size-4" /> Edit
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem>
                  <Trash className="size-4" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>

          {/* Command */}
          <div>
            <h4 className="text-sm font-medium mb-3">Command Palette</h4>
            <Command className="rounded-lg border shadow-md max-w-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>
                    <Calendar className="size-4" />
                    <span>Calendar</span>
                  </CommandItem>
                  <CommandItem>
                    <Search className="size-4" />
                    <span>Search</span>
                  </CommandItem>
                  <CommandItem>
                    <Settings className="size-4" />
                    <span>Settings</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      </ComponentSection>

      {/* Navigation */}
      <ComponentSection
        id="navigation"
        title="Navigation"
        description="Components for navigating between pages and sections."
      >
        <div className="space-y-8">
          {/* Tabs */}
          <div>
            <h4 className="text-sm font-medium mb-3">Tabs</h4>
            <Tabs defaultValue="account" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="account" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Account content here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="password" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Password content here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Configure your preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Settings content here.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Accordion */}
          <div>
            <h4 className="text-sm font-medium mb-3">Accordion</h4>
            <Accordion className="w-full max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match our design system.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It has smooth expand/collapse animations.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Breadcrumb */}
          <div>
            <h4 className="text-sm font-medium mb-3">Breadcrumb</h4>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Pagination */}
          <div>
            <h4 className="text-sm font-medium mb-3">Pagination</h4>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>2</PaginationLink>
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
        </div>
      </ComponentSection>

      {/* Data Display */}
      <ComponentSection
        id="data-display"
        title="Data Display"
        description="Components for presenting data and content."
      >
        <div className="space-y-8">
          {/* Table */}
          <div>
            <h4 className="text-sm font-medium mb-3">Table</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell><Badge variant="default">Active</Badge></TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Bob Wilson</TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell><Badge variant="destructive">Inactive</Badge></TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Card */}
          <div>
            <h4 className="text-sm font-medium mb-3">Card</h4>
            <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card content with some text.</p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>
              <Card className="card-interactive">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>Hover for lift effect.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">This card lifts on hover.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Badge */}
          <div>
            <h4 className="text-sm font-medium mb-3">Badge</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="outline">Success</Badge>
              <Badge variant="secondary">Warning</Badge>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <h4 className="text-sm font-medium mb-3">Avatar</h4>
            <div className="flex gap-4 items-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>AB</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Separator */}
          <div>
            <h4 className="text-sm font-medium mb-3">Separator</h4>
            <div className="space-y-4 max-w-md">
              <div>
                <h5 className="text-sm font-medium">Section Title</h5>
                <p className="text-sm text-muted-foreground">Some content here.</p>
              </div>
              <Separator />
              <div>
                <h5 className="text-sm font-medium">Another Section</h5>
                <p className="text-sm text-muted-foreground">More content below the separator.</p>
              </div>
            </div>
          </div>

          {/* Kbd */}
          <div>
            <h4 className="text-sm font-medium mb-3">Keyboard Shortcut (Kbd)</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <span className="text-muted-foreground">+</span>
                <Kbd>C</Kbd>
                <span className="ml-2 text-sm text-muted-foreground">Copy</span>
              </div>
              <div className="flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <span className="text-muted-foreground">+</span>
                <Kbd>V</Kbd>
                <span className="ml-2 text-sm text-muted-foreground">Paste</span>
              </div>
              <div className="flex items-center gap-1">
                <Kbd>Ctrl</Kbd>
                <span className="text-muted-foreground">+</span>
                <Kbd>S</Kbd>
                <span className="ml-2 text-sm text-muted-foreground">Save</span>
              </div>
            </div>
          </div>
        </div>
      </ComponentSection>

      {/* Layout */}
      <ComponentSection
        id="layout"
        title="Layout"
        description="Components for organizing and containing content."
      >
        <div className="space-y-8">
          {/* ScrollArea */}
          <div>
            <h4 className="text-sm font-medium mb-3">Scroll Area</h4>
            <ScrollArea className="h-48 w-64 rounded-md border p-4">
              <div className="space-y-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="text-sm">
                    Item {i + 1} - Scrollable content
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* AspectRatio */}
          <div>
            <h4 className="text-sm font-medium mb-3">Aspect Ratio</h4>
            <div className="grid gap-4 md:grid-cols-3 max-w-2xl">
              <div>
                <span className="text-xs text-muted-foreground block mb-2">16:9</span>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md flex items-center justify-center">
                  <Image className="size-8 text-muted-foreground" />
                </AspectRatio>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-2">4:3</span>
                <AspectRatio ratio={4 / 3} className="bg-muted rounded-md flex items-center justify-center">
                  <Image className="size-8 text-muted-foreground" />
                </AspectRatio>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-2">1:1</span>
                <AspectRatio ratio={1} className="bg-muted rounded-md flex items-center justify-center">
                  <Image className="size-8 text-muted-foreground" />
                </AspectRatio>
              </div>
            </div>
          </div>

          {/* Collapsible */}
          <div>
            <h4 className="text-sm font-medium mb-3">Collapsible</h4>
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="w-full max-w-md"
            >
              <div className="flex items-center justify-between space-x-4">
                <h4 className="text-sm font-semibold">
                  @peduarte starred 3 repositories
                </h4>
                <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
                  {isCollapsibleOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  <span className="sr-only">Toggle</span>
                </CollapsibleTrigger>
              </div>
              <div className="rounded-md border px-4 py-3 font-mono text-sm mt-2">
                @radix-ui/primitives
              </div>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                  @radix-ui/colors
                </div>
                <div className="rounded-md border px-4 py-3 font-mono text-sm">
                  @stitches/react
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </ComponentSection>
    </div>
  )
}
