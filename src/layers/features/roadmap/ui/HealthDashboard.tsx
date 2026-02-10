'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react'
import { getRoadmapItems } from '@/roadmap/roadmap'
import type { RoadmapItem } from '../model/types'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'success'
}

function MetricCard({ title, value, description, icon, variant = 'default' }: MetricCardProps) {
  const variantStyles = {
    default: 'text-foreground',
    warning: 'text-warning',
    success: 'text-success',
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={variantStyles[variant]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-muted-foreground text-xs mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

function calculateMetrics(items: RoadmapItem[]) {
  const total = items.length
  const mustHaveItems = items.filter(item => item.moscow === 'must-have')
  const mustHaveCount = mustHaveItems.length
  const mustHavePercentage = total > 0 ? Math.round((mustHaveCount / total) * 100) : 0

  const inProgressCount = items.filter(item => item.status === 'in-progress').length

  const atRiskOrBlockedCount = items.filter(
    item => item.health === 'at-risk' || item.health === 'blocked'
  ).length

  return {
    total,
    mustHavePercentage,
    inProgressCount,
    atRiskOrBlockedCount,
  }
}

export function HealthDashboard() {
  const items = getRoadmapItems()
  const metrics = calculateMetrics(items)

  const mustHaveVariant = metrics.mustHavePercentage > 60 ? 'warning' : 'default'
  const mustHaveDescription =
    metrics.mustHavePercentage > 60
      ? 'High must-have ratio - consider re-prioritizing'
      : 'Healthy prioritization balance'

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Must-Have Priority"
        value={`${metrics.mustHavePercentage}%`}
        description={mustHaveDescription}
        icon={
          mustHaveVariant === 'warning' ? (
            <AlertTriangle className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )
        }
        variant={mustHaveVariant}
      />

      <MetricCard
        title="Total Items"
        value={metrics.total}
        description="All roadmap items"
        icon={<ListTodo className="size-4" />}
      />

      <MetricCard
        title="In Progress"
        value={metrics.inProgressCount}
        description="Currently active"
        icon={<Clock className="size-4" />}
      />

      <MetricCard
        title="At Risk / Blocked"
        value={metrics.atRiskOrBlockedCount}
        description="Needs attention"
        icon={<AlertTriangle className="size-4" />}
        variant={metrics.atRiskOrBlockedCount > 0 ? 'warning' : 'success'}
      />
    </div>
  )
}
