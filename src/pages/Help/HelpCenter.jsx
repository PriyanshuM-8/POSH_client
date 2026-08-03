import React, { useState } from 'react'
import { MessageSquare, Phone, Mail, BookOpen, Download, AlertCircle, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePosh } from '@/context/PoshContext'

export default function HelpCenter() {
  const { companySettings } = usePosh()
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      q: 'Who can file a POSH complaint on this system?',
      a: 'Any employee, contractor, intern, or visitor at Acme Corporation who has experienced sexual harassment at the workplace or during work-related events/travel can file a complaint.'
    },
    {
      q: 'Can I file a complaint anonymously?',
      a: 'Yes. The system supports anonymous filing. Your demographic details (name, employee ID) will be encrypted and hidden from general admin dashboards until official investigation warrants verification by the chairperson.'
    },
    {
      q: 'What is the statutory timeline for case investigation?',
      a: 'Under the POSH Act, 2013, the Internal Committee is legally mandated to complete the inquiry and submit the final investigation report within 90 days from the filing date.'
    },
    {
      q: 'Can I resolve the complaint through conciliation?',
      a: 'Yes. Before initiating inquiry proceedings, at the request of the complainant, the IC can take steps to settle the matter through conciliation, provided no monetary settlement is proposed as a basis.'
    }
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Help & Resource Center</h1>
        <p className="mt-0.5 text-sm text-muted-foreground font-medium">Compliance handbooks, contact directory, and legal guidelines.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

        {/* Handbook downloads */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Resources</CardTitle>
              <CardDescription>Statutory literature and policies</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-1 pt-0">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-white/5 bg-slate-50/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">POSH Handbook.pdf</span>
                </div>
                <Button size="xs" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-white/5 bg-slate-50/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-500" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Statutory Rules.pdf</span>
                </div>
                <Button size="xs" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>

        {/* FAQs */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Guidance on statutory rights, process, and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx
                return (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-slate-700 bg-slate-50/50 hover:bg-slate-50 dark:text-slate-200 dark:bg-white/5"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary-500" /> {faq.q}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 text-xs leading-relaxed text-slate-500 bg-white border-t border-slate-50 dark:text-slate-300 dark:bg-navy-800 dark:border-white/5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

        {/* Contact details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Direct Support</CardTitle>
            <CardDescription>Confidential helpline channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0 w-full text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-white/5 bg-slate-50/20">
              <Phone className="h-4 w-4 text-primary-500" />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Helpline phone</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">+91 1800 200 900</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-white/5 bg-slate-50/20">
              <Mail className="h-4 w-4 text-primary-500" />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Compliance Email</p>
                <p className="text-sm  font-semibold text-slate-700 dark:text-slate-200 truncate">{companySettings.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-white/5 bg-slate-50/20">
              <MessageSquare className="h-4 w-4 text-primary-500" />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Location Office</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Block B, 3rd Floor, Mumbai HQ</p>
              </div>
            </div>
          </CardContent>
        </Card>
          
        </div>
      </div>
    </div>
  )
}
