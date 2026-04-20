"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTeam } from "@/lib/team-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Slack,
  Webhook,
  Github,
  Cloud,
  Database,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { IntegrationType, Integration } from "@/lib/integrations";

interface IntegrationConfig {
  type: IntegrationType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  fields: Array<{
    key: string;
    label: string;
    type: "text" | "password" | "url";
    required: boolean;
    placeholder?: string;
  }>;
  settings: Array<{
    key: string;
    label: string;
    description: string;
    type: "toggle";
    defaultValue: boolean;
  }>;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    type: "slack",
    name: "Slack",
    description: "Run /fix commands directly from Slack channels and get instant incident responses.",
    icon: <Slack className="h-6 w-6" />,
    color: "bg-purple-500/10 text-purple-600",
    fields: [
      { key: "botToken", label: "Bot Token", type: "password", required: true, placeholder: "xoxb-..." },
      { key: "signingSecret", label: "Signing Secret", type: "password", required: true },
      { key: "defaultChannel", label: "Default Channel (optional)", type: "text", required: false, placeholder: "#alerts" },
    ],
    settings: [
      { key: "slashCommandEnabled", label: "Enable /fix command", description: "Allow users to run /fix in Slack", type: "toggle", defaultValue: true },
      { key: "autoPushEnabled", label: "Auto-push results", description: "Automatically send fix results to channel", type: "toggle", defaultValue: false },
    ],
  },
  {
    type: "webhook",
    name: "Webhook",
    description: "Receive alerts from Datadog, Cloudflare, or custom sources to auto-trigger fixes.",
    icon: <Webhook className="h-6 w-6" />,
    color: "bg-blue-500/10 text-blue-600",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "url", required: true, placeholder: "https://..." },
      { key: "secret", label: "Secret Token", type: "password", required: true, placeholder: "Min 32 chars" },
    ],
    settings: [
      { key: "autoTriggerEnabled", label: "Auto-trigger fixes", description: "Automatically run fix analysis on alerts", type: "toggle", defaultValue: true },
    ],
  },
  {
    type: "github",
    name: "GitHub",
    description: "Comment /fix on PRs to get automated fix suggestions based on errors.",
    icon: <Github className="h-6 w-6" />,
    color: "bg-gray-500/10 text-gray-600",
    fields: [
      { key: "appId", label: "App ID", type: "text", required: true },
      { key: "privateKey", label: "Private Key", type: "password", required: true },
    ],
    settings: [
      { key: "commentOnPR", label: "Comment on PRs", description: "Post fix suggestions as PR comments", type: "toggle", defaultValue: true },
      { key: "suggestFixes", label: "Auto-suggest fixes", description: "Automatically suggest fixes for errors", type: "toggle", defaultValue: false },
    ],
  },
  {
    type: "datadog",
    name: "Datadog",
    description: "Connect Datadog monitors to trigger fixes on alerts.",
    icon: <Database className="h-6 w-6" />,
    color: "bg-indigo-500/10 text-indigo-600",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", required: true },
      { key: "appKey", label: "Application Key", type: "password", required: true },
    ],
    settings: [],
  },
  {
    type: "cloudflare",
    name: "Cloudflare",
    description: "Ingest Cloudflare logs and alerts for automatic incident detection.",
    icon: <Cloud className="h-6 w-6" />,
    color: "bg-orange-500/10 text-orange-600",
    fields: [
      { key: "apiToken", label: "API Token", type: "password", required: true },
    ],
    settings: [
      { key: "logPushEnabled", label: "Enable Logpush", description: "Receive Cloudflare logs", type: "toggle", defaultValue: false },
    ],
  },
];

export default function IntegrationsSettingsPage() {
  const { user, session } = useAuth();
  const { activeWorkspace } = useTeam();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [settingsData, setSettingsData] = useState<Record<string, boolean>>({});

  // Load integrations on mount
  const loadIntegrations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/integrations?teamId=${activeWorkspace?.id || ""}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch {
      toast.error("Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  }, [user, activeWorkspace, session?.access_token]);

  const handleConnect = (config: IntegrationConfig) => {
    setSelectedIntegration(config);
    setFormData({});
    setSettingsData(
      config.settings.reduce((acc, s) => ({ ...acc, [s.key]: s.defaultValue }), {})
    );
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedIntegration || !user) return;

    // Validate required fields
    for (const field of selectedIntegration.fields) {
      if (field.required && !formData[field.key]?.trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: selectedIntegration.type,
          name: selectedIntegration.name,
          teamId: activeWorkspace?.kind === "team" ? activeWorkspace.id : null,
          settings: { ...formData, ...settingsData },
        }),
      });

      if (response.ok) {
        toast.success(`${selectedIntegration.name} connected!`);
        setIsDialogOpen(false);
        loadIntegrations();
      } else {
        const err = await response.json();
        toast.error(err.error || "Failed to connect");
      }
    } catch {
      toast.error("Failed to connect integration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (integrationId: string, name: string) => {
    if (!confirm(`Disconnect ${name}?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/integrations?id=${integrationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (response.ok) {
        toast.success(`${name} disconnected`);
        loadIntegrations();
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setIsLoading(false);
    }
  };

  const copyWebhookUrl = (integrationId: string) => {
    const url = `${window.location.origin}/api/webhook?id=${integrationId}`;
    navigator.clipboard.writeText(url);
    toast.success("Webhook URL copied!");
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Connected</Badge>;
      case "error":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      case "pending":
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Pending</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getConnectedIntegration = (type: IntegrationType) => {
    return integrations.find((i) => i.type === type);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect Kintify to your tools. Run /fix where your incidents happen.
          </p>
        </div>

        {/* Security Notice */}
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Secure by Design</h3>
              <p className="text-sm text-amber-800">
                All tokens and secrets are encrypted at rest. We never store raw credentials—only masked versions for display.
                Webhook signatures are verified on every request.
              </p>
            </div>
          </div>
        </Card>

        {/* Connected Integrations */}
        {integrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Connected</h2>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${INTEGRATIONS.find(i => i.type === integration.type)?.color || "bg-gray-100"}`}>
                        {INTEGRATIONS.find(i => i.type === integration.type)?.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(integration.status)}
                          <span className="text-xs text-muted-foreground">
                            Added {new Date(integration.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.type === "webhook" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyWebhookUrl(integration.id)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy URL
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDisconnect(integration.id, integration.name)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {INTEGRATIONS.map((config) => {
              const connected = getConnectedIntegration(config.type);
              return (
                <Card key={config.type} className={`p-5 ${connected ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{config.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                      {connected ? (
                        <Badge className="mt-3" variant="outline">Already connected</Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="mt-3"
                          onClick={() => handleConnect(config)}
                          disabled={isLoading}
                        >
                          Connect
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* API Access Card */}
        <Card className="mt-8 p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Webhook className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">API Access</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the Kintify API to programmatically run fixes from your automation pipelines.
              </p>
              <div className="mt-3 p-3 bg-muted rounded-lg font-mono text-sm">
                POST https://kintify.cloud/api/fix
              </div>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Connect Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration?.icon}
              Connect {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedIntegration?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Configuration Fields */}
            {selectedIntegration?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}

            {/* Settings Toggles */}
            {selectedIntegration?.settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={setting.key} className="font-medium">
                    {setting.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  id={setting.key}
                  checked={settingsData[setting.key] ?? setting.defaultValue}
                  onCheckedChange={(checked) =>
                    setSettingsData((prev) => ({ ...prev, [setting.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
