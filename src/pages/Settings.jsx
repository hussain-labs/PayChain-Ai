// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Settings Page
// Merchant profile, wallet config, notification preferences, API keys (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import {
  Settings as SettingsIcon, User, Bell, Shield, Key,
  Wallet, Save, CheckCircle2, AlertTriangle, Copy,
  Eye, EyeOff, ExternalLink,
} from 'lucide-react'
import SectionHeader     from '@components/ui/SectionHeader'
import ComingSoonOverlay from '@components/ui/ComingSoonOverlay'
import { useWallet }     from '@hooks/useWallet'
import { MOCK_MERCHANT, CONTRACTS, API } from '@config'

const TABS = [
  { id: 'profile',  label: 'Profile',       icon: User   },
  { id: 'wallet',   label: 'Wallet',        icon: Wallet },
  { id: 'notifs',   label: 'Notifications', icon: Bell   },
  { id: 'security', label: 'Security',      icon: Shield },
  { id: 'api',      label: 'API Keys',      icon: Key    },
]

// ── Reusable form row ────────────────────────────────────────────────────────
function FormRow({ label, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-5 border-b border-slate-800/60 last:border-0">
      <div className="sm:w-56 shrink-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {hint && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function TextInput({ defaultValue, placeholder, disabled }) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      className="
        w-full px-3 py-2 rounded-xl text-sm
        bg-slate-800/60 border border-slate-700/60
        text-slate-200 placeholder:text-slate-600
        focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all
      "
    />
  )
}

function Toggle({ label, description, defaultChecked }) {
  const [on, setOn] = useState(defaultChecked ?? false)
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => setOn(v => !v)}
        className={`
          relative inline-flex w-10 h-5 rounded-full shrink-0 mt-0.5
          transition-colors duration-200
          ${on ? 'bg-blue-500' : 'bg-slate-700'}
        `}
      >
        <span className={`
          absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow
          transition-transform duration-200
          ${on ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
      <div>
        <p className="text-sm text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

// ── Tab panels ────────────────────────────────────────────────────────────────
function ProfileTab() {
  return (
    <div>
      <FormRow label="Business Name" hint="Displayed on your merchant profile">
        <TextInput defaultValue={MOCK_MERCHANT.name} />
      </FormRow>
      <FormRow label="Merchant ID" hint="Your unique PayChain identifier">
        <div className="flex items-center gap-2">
          <TextInput defaultValue={MOCK_MERCHANT.id} disabled />
          <button className="btn-secondary shrink-0"><Copy className="w-3.5 h-3.5" /></button>
        </div>
      </FormRow>
      <FormRow label="Plan" hint="Current subscription tier">
        <div className="flex items-center gap-2">
          <span className="badge-ai">{MOCK_MERCHANT.plan}</span>
          <button className="btn-ghost text-xs">Upgrade</button>
        </div>
      </FormRow>
      <FormRow label="Member Since">
        <TextInput defaultValue={MOCK_MERCHANT.joinedDate} disabled />
      </FormRow>
      <div className="pt-4">
        <button className="btn-primary">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </div>
  )
}

function WalletTab() {
  const { address, isConnected, shortAddress, chainMeta, formattedBalance, connectMetaMask, disconnect } = useWallet()
  return (
    <div>
      <FormRow label="Connected Wallet" hint="Primary wallet for receiving payments">
        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-mono text-slate-300 truncate">{address}</p>
                {formattedBalance && (
                  <p className="text-xs text-slate-500 mt-0.5">Balance: {formattedBalance}</p>
                )}
              </div>
              <a
                href={`https://sepolia.etherscan.io/address/${address}`}
                target="_blank" rel="noreferrer"
                className="shrink-0 text-slate-500 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <button onClick={disconnect} className="btn-secondary text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10">
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-amber-400">No wallet connected</p>
            </div>
            <button onClick={connectMetaMask} className="btn-primary text-xs">
              <Wallet className="w-3.5 h-3.5" /> Connect MetaMask
            </button>
          </div>
        )}
      </FormRow>
      <FormRow label="Network" hint="Connected blockchain network">
        <div className="flex items-center gap-2">
          <span className="badge-ai">{chainMeta?.icon} {chainMeta?.name ?? 'Not Connected'}</span>
        </div>
      </FormRow>
      <FormRow label="Contract Addresses" hint="Deployed PayChain contracts — configure in Phase 2">
        <div className="space-y-2">
          {Object.entries(CONTRACTS).map(([name, c]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-36 shrink-0">{name.replace(/_/g, ' ')}</span>
              <TextInput defaultValue={c.address} disabled />
            </div>
          ))}
        </div>
      </FormRow>
    </div>
  )
}

function NotificationsTab() {
  return (
    <div className="space-y-5 py-2">
      {[
        { label: 'Transaction Alerts',      description: 'Notify on every incoming payment',             defaultChecked: true  },
        { label: 'Escrow Updates',          description: 'Get updates when escrow status changes',       defaultChecked: true  },
        { label: 'Dispute Notifications',   description: 'Alert when a dispute is opened or resolved',  defaultChecked: true  },
        { label: 'AI Fraud Alerts',         description: 'Real-time fraud detection notifications',     defaultChecked: false },
        { label: 'Weekly Summary Email',    description: 'Receive a weekly revenue digest',             defaultChecked: false },
      ].map((n, i) => (
        <div key={i} className="pb-5 border-b border-slate-800/60 last:border-0">
          <Toggle {...n} />
        </div>
      ))}
    </div>
  )
}

function SecurityTab() {
  return (
    <div>
      <FormRow label="Two-Factor Auth" hint="Require 2FA on high-value operations">
        <Toggle label="Enable 2FA" description="Adds an extra layer of security to your account" />
      </FormRow>
      <FormRow label="Session Timeout" hint="Auto-disconnect wallet after inactivity">
        <select className="px-3 py-2 rounded-xl text-sm bg-slate-800/60 border border-slate-700/60 text-slate-200 focus:outline-none focus:border-blue-500/50">
          <option>15 minutes</option>
          <option>30 minutes</option>
          <option>1 hour</option>
          <option>Never</option>
        </select>
      </FormRow>
      <FormRow label="Transaction Signing" hint="Require MetaMask signature for every payout">
        <Toggle label="Require signature" defaultChecked />
      </FormRow>
    </div>
  )
}

function ApiKeysTab() {
  const [show, setShow] = useState(false)
  return (
    <ComingSoonOverlay
      title="API Key Management"
      description="Generate and rotate API keys for Gemini AI integration, webhook endpoints, and third-party payment processors — available in Phase 2."
      phase="Phase 2"
      icon="zap"
      blurContent
    >
      <div className="space-y-1 py-2">
        <FormRow label="Gemini API Key" hint="Used for AI trust scoring and fraud detection">
          <div className="flex items-center gap-2">
            <input
              type={show ? 'text' : 'password'}
              value="gm-••••••••••••••••••••••••"
              readOnly
              className="flex-1 px-3 py-2 rounded-xl text-sm bg-slate-800/60 border border-slate-700/60 text-slate-400 font-mono"
            />
            <button onClick={() => setShow(v => !v)} className="btn-secondary shrink-0">
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </FormRow>
        <FormRow label="Webhook Secret" hint="Validates incoming webhook payloads">
          <TextInput defaultValue="wh_••••••••••••••••" disabled />
        </FormRow>
      </div>
    </ComingSoonOverlay>
  )
}

const TAB_PANELS = {
  profile:  <ProfileTab />,
  wallet:   <WalletTab />,
  notifs:   <NotificationsTab />,
  security: <SecurityTab />,
  api:      <ApiKeysTab />,
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-700/50 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Settings</h2>
          <p className="text-sm text-slate-500">Configure your merchant account</p>
        </div>
      </div>

      {/* Settings panel */}
      <div className="glass-card overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-800/60 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap
                border-b-2 transition-all duration-150
                ${activeTab === id
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-700'}
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {TAB_PANELS[activeTab]}
        </div>
      </div>
    </div>
  )
}
