"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { issueBatch, type Recipient, type IssueBatchResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface Template {
  id: string;
  name: string;
}

export function IssueForm({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState("");
  const [certificateTitle, setCertificateTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [batchName, setBatchName] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: "", email: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<IssueBatchResult | null>(null);

  function addRecipient() {
    setRecipients((prev) => [...prev, { name: "", email: "" }]);
  }

  function removeRecipient(index: number) {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRecipient(index: number, field: keyof Recipient, value: string) {
    setRecipients((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());

      const hasHeader = lines[0]?.toLowerCase().includes("name");
      const dataLines = hasHeader ? lines.slice(1) : lines;

      const parsed: Recipient[] = dataLines
        .map((line) => {
          const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
          return { name: parts[0] ?? "", email: parts[1] ?? "" };
        })
        .filter((r) => r.name.length > 0);

      if (parsed.length > 0) {
        setRecipients(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleSubmit() {
    const validRecipients = recipients.filter((r) => r.name.trim());
    if (!templateId || !certificateTitle || validRecipients.length === 0) {
      alert("Please select a template, enter a title, and add at least one recipient.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await issueBatch(
        templateId,
        certificateTitle,
        eventName,
        batchName,
        validRecipients
      );
      setResult(res);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          {result.failureCount === 0 ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-success" />
          ) : (
            <XCircle className="mx-auto h-12 w-12 text-brand-error" />
          )}
          <h2 className="mt-4 text-lg font-bold text-brand-text">
            Batch {result.failureCount === 0 ? "Complete" : "Completed with Errors"}
          </h2>
          <div className="mt-2 flex justify-center gap-4 text-sm">
            <span className="text-brand-muted">
              Total: <strong className="text-brand-text">{result.totalCount}</strong>
            </span>
            <span className="text-brand-success">
              Success: <strong>{result.successCount}</strong>
            </span>
            {result.failureCount > 0 && (
              <span className="text-brand-error">
                Failed: <strong>{result.failureCount}</strong>
              </span>
            )}
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push("/certificates")}>
              Back to Dashboard
            </Button>
            <Button onClick={() => router.push(`/certificates/batches/${result.batchId}`)}>
              View Batch
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-brand-text">
            Certificate Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Template</Label>
              {templates.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  No active templates. Create one first.
                </p>
              ) : (
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_name">Batch Name</Label>
              <Input
                id="batch_name"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. React Workshop Oct 2026"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cert_title">Certificate Title</Label>
              <Input
                id="cert_title"
                required
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                placeholder="e.g. Certificate of Participation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_name">Event Name (optional)</Label>
              <Input
                id="event_name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. React Workshop 2026"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-brand-text">
            Recipients
            <Badge variant="secondary" className="ml-2">
              {recipients.filter((r) => r.name.trim()).length}
            </Badge>
          </CardTitle>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleCsvImport}
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-3.5 w-3.5" />
                  Import CSV
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={addRecipient}>
              <Plus className="h-3.5 w-3.5" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-xs text-brand-muted">
            CSV format: name,email (one per line, header row optional)
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email (optional)</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipients.map((recipient, index) => (
                <TableRow key={index}>
                  <TableCell className="text-brand-muted">{index + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, "name", e.target.value)}
                      placeholder="Recipient name"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="email"
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, "email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </TableCell>
                  <TableCell>
                    {recipients.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-brand-error" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/certificates")}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !templateId || !certificateTitle}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Issue {recipients.filter((r) => r.name.trim()).length} Certificate
          {recipients.filter((r) => r.name.trim()).length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
