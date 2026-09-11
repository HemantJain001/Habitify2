'use client'

import { Suspense, type ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { AppChromeProvider, useAppChrome } from '@/components/layout/AppChrome'
import { cn } from '@/lib/utils'

function ShellFrame({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppChrome()

  return (
    <div className="app-shell min-h-screen pb-20 lg:pb-0">
      <Suspense fallback={<div className="hidden lg:block w-[240px]" />}>
        <Sidebar onCollapseChange={setSidebarCollapsed} />
      </Suspense>

      <div
        className={cn(
          'layout-transition',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'
        )}
      >
        <TopBar title={title} subtitle={subtitle} />
        <main className="px-4 sm:px-6 md:px-8 py-6 md:py-8 max-w-[1120px] mx-auto">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  )
}

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <AppChromeProvider>
      <ShellFrame title={title} subtitle={subtitle}>
        {children}
      </ShellFrame>
    </AppChromeProvider>
  )
}
