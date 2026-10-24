"use client";

import { useRef, useState } from "react";
import { createTemplate, updateTemplate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Upload, Loader2 } from "lucide-react";

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  background_storage_path: string;
  canvas_width: number;
  canvas_height: number;
  design_config: Record<string, unknown>;
  status: string;
}

export function TemplateForm({
  template,
  backgroundUrl,
}: {
  template?: TemplateData;
  backgroundUrl?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(backgroundUrl ?? null);
  const [status, setStatus] = useState(template?.status ?? "draft");

  const [designConfig, setDesignConfig] = useState(() => {
    const defaults = {
      nameField: { x: 0.5, y: 0.45, fontSize: 48, fontColor: "#000000", align: "center" },
      titleField: { x: 0.5, y: 0.35, fontSize: 32, fontColor: "#333333", align: "center" },
      dateField: { x: 0.5, y: 0.55, fontSize: 20, fontColor: "#666666", align: "center" },
      certNumberField: { x: 0.5, y: 0.9, fontSize: 12, fontColor: "#999999", align: "center" },
      qrCode: { x: 0.85, y: 0.85, size: 80 },
    };
    if (template?.design_config && typeof template.design_config === "object") {
      return { ...defaults, ...template.design_config };
    }
    return defaults;
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    formData.set("status", status);
    formData.set("design_config", JSON.stringify(designConfig));
    try {
      if (template) {
        await updateTemplate(template.id, formData);
      } else {
        await createTemplate(formData);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text">
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={template?.name ?? ""}
                placeholder="e.g. Workshop Completion Certificate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={template?.description ?? ""}
                placeholder="Optional notes about this template"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="canvas_width">Canvas Width (px)</Label>
                <Input
                  id="canvas_width"
                  name="canvas_width"
                  type="number"
                  required
                  min={100}
                  defaultValue={template?.canvas_width ?? 1920}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canvas_height">Canvas Height (px)</Label>
                <Input
                  id="canvas_height"
                  name="canvas_height"
                  type="number"
                  required
                  min={100}
                  defaultValue={template?.canvas_height ?? 1080}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-brand-text">
              Background Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background">
                Upload {template ? "(replace existing)" : ""}
              </Label>
              <label
                htmlFor="background"
                className="flex min-h-[160px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-brand-border transition-colors hover:border-brand-cyan/50"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Template background preview"
                    className="max-h-[300px] rounded-lg object-contain"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="mx-auto h-8 w-8 text-brand-muted" />
                    <p className="mt-2 text-sm text-brand-muted">
                      Click to upload PNG, JPG, or WebP
                    </p>
                  </div>
                )}
              </label>
              <input
                id="background"
                name="background"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                required={!template}
                onChange={handleFileChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-brand-text">
            Text Placement Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-xs text-brand-muted">
            Coordinates use normalized values (0-1). (0.5, 0.5) is center. Font
            sizes are in pixels.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["nameField", "Recipient Name"],
                ["titleField", "Certificate Title"],
                ["dateField", "Issue Date"],
                ["certNumberField", "Certificate Number"],
              ] as const
            ).map(([key, label]) => {
              const field = (designConfig as Record<string, Record<string, unknown>>)[key] ?? {};
              return (
                <div key={key} className="space-y-3 rounded-lg border border-brand-border p-3">
                  <p className="text-xs font-medium text-brand-text">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">X</Label>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={(field.x as number) ?? 0.5}
                        onChange={(e) =>
                          setDesignConfig((prev) => ({
                            ...prev,
                            [key]: { ...((prev as Record<string, Record<string, unknown>>)[key] ?? {}), x: parseFloat(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Y</Label>
                      <Input
                        type="number"
                        step={0.01}
                        min={0}
                        max={1}
                        value={(field.y as number) ?? 0.5}
                        onChange={(e) =>
                          setDesignConfig((prev) => ({
                            ...prev,
                            [key]: { ...((prev as Record<string, Record<string, unknown>>)[key] ?? {}), y: parseFloat(e.target.value) },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Font Size</Label>
                      <Input
                        type="number"
                        min={8}
                        max={200}
                        value={(field.fontSize as number) ?? 24}
                        onChange={(e) =>
                          setDesignConfig((prev) => ({
                            ...prev,
                            [key]: { ...((prev as Record<string, Record<string, unknown>>)[key] ?? {}), fontSize: parseInt(e.target.value) },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Color</Label>
                      <Input
                        type="color"
                        value={(field.fontColor as string) ?? "#000000"}
                        onChange={(e) =>
                          setDesignConfig((prev) => ({
                            ...prev,
                            [key]: { ...((prev as Record<string, Record<string, unknown>>)[key] ?? {}), fontColor: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="space-y-3 rounded-lg border border-brand-border p-3">
              <p className="text-xs font-medium text-brand-text">QR Code</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">X</Label>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={((designConfig as Record<string, Record<string, unknown>>).qrCode?.x as number) ?? 0.85}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        qrCode: { ...prev.qrCode, x: parseFloat(e.target.value) },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Y</Label>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={((designConfig as Record<string, Record<string, unknown>>).qrCode?.y as number) ?? 0.85}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        qrCode: { ...prev.qrCode, y: parseFloat(e.target.value) },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="text-[10px]">Size (px)</Label>
                <Input
                  type="number"
                  min={40}
                  max={400}
                  value={((designConfig as Record<string, Record<string, unknown>>).qrCode?.size as number) ?? 80}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      qrCode: { ...prev.qrCode, size: parseInt(e.target.value) },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" asChild>
          <a href="/certificates/templates">Cancel</a>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {template ? "Update Template" : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
