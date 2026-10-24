"use client";

import { useState } from "react";
import Link from "next/link";
import { revokeCertificate, reinstateCertificate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Ban, RotateCcw, ExternalLink } from "lucide-react";

interface Certificate {
  id: string;
  certificate_number: string;
  verification_token: string;
  recipient_name: string;
  recipient_email: string | null;
  status: string;
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
}

interface Batch {
  id: string;
  name: string;
  certificate_title: string;
  event_name: string | null;
  status: string;
  total_count: number;
  success_count: number;
  failure_count: number;
  created_at: string;
  completed_at: string | null;
}

const VERIFY_BASE = "https://hustlerhive.vercel.app/verify/certificate";

export function BatchDetail({
  batch,
  certificates,
  canRevoke,
}: {
  batch: Batch;
  certificates: Certificate[];
  canRevoke: boolean;
}) {
  const [revokeReason, setRevokeReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleRevoke(certId: string) {
    setProcessing(certId);
    try {
      await revokeCertificate(certId, revokeReason);
      setRevokeReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReinstate(certId: string) {
    setProcessing(certId);
    try {
      await reinstateCertificate(certId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error");
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/certificates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-bold text-brand-text">{batch.name}</h1>
          <p className="text-sm text-brand-muted">
            {batch.certificate_title}
            {batch.event_name && ` — ${batch.event_name}`}
          </p>
        </div>
        <Badge
          variant={
            batch.status === "completed"
              ? "success"
              : batch.status === "failed"
                ? "destructive"
                : "secondary"
          }
          className="ml-auto"
        >
          {batch.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-brand-muted">Total</p>
            <p className="text-2xl font-bold text-brand-text">
              {batch.total_count}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-brand-muted">Issued</p>
            <p className="text-2xl font-bold text-brand-success">
              {batch.success_count}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-brand-muted">Failed</p>
            <p className="text-2xl font-bold text-brand-error">
              {batch.failure_count}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-brand-text">
            Certificates ({certificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="hidden md:table-cell">Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Verify Link</TableHead>
                {canRevoke && <TableHead className="w-24" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-mono text-xs text-brand-text">
                    {cert.certificate_number}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-brand-text">
                      {cert.recipient_name}
                    </div>
                    {cert.recipient_email && (
                      <div className="text-xs text-brand-muted">
                        {cert.recipient_email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-xs text-brand-muted md:table-cell">
                    {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cert.status === "valid" ? "success" : "destructive"}
                    >
                      {cert.status}
                    </Badge>
                    {cert.revocation_reason && (
                      <p className="mt-0.5 text-[10px] text-brand-muted">
                        {cert.revocation_reason}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <a
                      href={`${VERIFY_BASE}/${cert.verification_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-brand-cyan hover:underline"
                    >
                      Verify
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  {canRevoke && (
                    <TableCell className="text-right">
                      {cert.status === "valid" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={processing === cert.id}
                            >
                              <Ban className="h-3.5 w-3.5 text-brand-error" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke {cert.certificate_number}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This certificate will show as revoked on the
                                public verification page. You can reinstate it
                                later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-2">
                              <Input
                                placeholder="Reason for revocation"
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRevoke(cert.id)}
                                className="bg-brand-error hover:bg-brand-error/90"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processing === cert.id}
                          onClick={() => handleReinstate(cert.id)}
                        >
                          <RotateCcw className="h-3.5 w-3.5 text-brand-success" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
