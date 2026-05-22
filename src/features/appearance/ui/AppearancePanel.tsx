import { useId, useMemo } from "react";



import { Button } from "@/shared/ui/primitives/button";

import { Card } from "@/shared/ui/primitives/card";

import { Input } from "@/shared/ui/primitives/input";

import { Label } from "@/shared/ui/primitives/label";

import { Slider } from "@/shared/ui/primitives/slider";

import { Switch } from "@/shared/ui/primitives/switch";

import {

  AccordionContent,

  AccordionItem,

  AccordionTrigger,

} from "@/shared/ui/primitives/accordion";

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from "@/shared/ui/primitives/select";

import { SURFACE_MATERIAL_OPTIONS } from "@/shared/lib/surfaceMaterial";

import {

  appearancePresets,

  type AppearanceSettings,

  type FontChoice,

} from "../lib/appearance";

import { useAppearancePanel } from "../model/useAppearancePanel";



function AppearanceSlider({

  label,

  displayValue,

  value,

  min,

  max,

  step,

  onValueChange,

}: {

  label: string;

  displayValue: string;

  value: number;

  min: number;

  max: number;

  step: number;

  onValueChange: (v: number) => void;

}) {

  return (

    <div className="space-y-2">

      <div className="flex items-center justify-between gap-2">

        <Label>{label}</Label>

        <div className="text-xs text-muted-foreground">{displayValue}</div>

      </div>

      <Slider

        value={[value]}

        min={min}

        max={max}

        step={step}

        onValueChange={(v) => onValueChange(v[0] ?? value)}

      />

    </div>

  );

}



function SurfaceMaterialSelectField({

  label,

  value,

  onValueChange,

}: {

  label: string;

  value: AppearanceSettings["cardMaterial"];

  onValueChange: (value: AppearanceSettings["cardMaterial"]) => void;

}) {

  return (

    <div className="space-y-2">

      <Label>{label}</Label>

      <Select value={value} onValueChange={(next) => onValueChange(next as AppearanceSettings["cardMaterial"])}>

        <SelectTrigger>

          <SelectValue placeholder="选择材质" />

        </SelectTrigger>

        <SelectContent>

          {SURFACE_MATERIAL_OPTIONS.map((option) => (

            <SelectItem key={option.value} value={option.value}>

              {option.label}

            </SelectItem>

          ))}

        </SelectContent>

      </Select>

    </div>

  );

}



function AppearanceSwitchField({

  label,

  description,

  checked,

  onCheckedChange,

}: {

  label: string;

  description?: string;

  checked: boolean;

  onCheckedChange: (checked: boolean) => void;

}) {

  const switchId = useId();

  const descriptionId = description ? `${switchId}-description` : undefined;



  return (

    <div className="flex items-center justify-between gap-3 py-1">

      <div className="space-y-0.5">

        <Label htmlFor={switchId}>{label}</Label>

        {description ? (

          <p id={descriptionId} className="text-xs text-muted-foreground">

            {description}

          </p>

        ) : null}

      </div>

      <Switch

        id={switchId}

        checked={checked}

        aria-describedby={descriptionId}

        onCheckedChange={onCheckedChange}

      />

    </div>

  );

}



function AppearanceSection({

  title,

  description,

  children,

}: {

  title: string;

  description: string;

  children: React.ReactNode;

}) {

  return (

    <section className="space-y-3 rounded-md border bg-muted/20 p-3">

      <div className="space-y-1">

        <div className="text-sm font-medium">{title}</div>

        <p className="text-xs text-muted-foreground">{description}</p>

      </div>

      {children}

    </section>

  );

}



export function AppearancePanel() {

  const {

    appearance,

    bgPreview,

    bgInputId,

    bgInputRef,

    persist,

    openBackgroundPicker,

    removeBackground,

    resetAppearance,

    handleBackgroundFileChange,

  } = useAppearancePanel();

  const presetOptions = useMemo(() => appearancePresets, []);

  const canShowCustom = appearance.mode === "custom";



  return (

    <AccordionItem value="appearance" className="border-none">

      <Card className="p-0">

        <AccordionTrigger className="px-4">外观主题</AccordionTrigger>

        <AccordionContent className="px-4">

          <div className="space-y-4">

            <AppearanceSection

              title="配色与字体"

              description="调整整体配色、圆角和排版风格。"

            >

              <div className="space-y-2">

                <Label>配色方式</Label>

                <Select

                  value={appearance.mode}

                  onValueChange={(v) =>

                    void persist({

                      ...appearance,

                      mode: v as AppearanceSettings["mode"],

                    })

                  }

                >

                  <SelectTrigger>

                    <SelectValue placeholder="选择" />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="preset">预设方案</SelectItem>

                    <SelectItem value="custom">完全自定义</SelectItem>

                  </SelectContent>

                </Select>

              </div>



              {appearance.mode === "preset" ? (

                <div className="space-y-2">

                  <Label>预设配色</Label>

                  <Select

                    value={appearance.presetGroupId}

                    onValueChange={(v) =>

                      void persist({

                        ...appearance,

                        presetGroupId: v as AppearanceSettings["presetGroupId"],

                      })

                    }

                  >

                    <SelectTrigger>

                      <SelectValue placeholder="选择预设" />

                    </SelectTrigger>

                    <SelectContent>

                      {presetOptions.map((p) => (

                        <SelectItem key={p.id} value={p.id}>

                          {p.name}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                </div>

              ) : null}



              {canShowCustom ? (

                <div className="space-y-3">

                  <div className="text-xs text-muted-foreground">

                    自定义会优先应用背景、文字和主色，其它色保持现有设计系统，避免对比度失衡。

                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <div className="space-y-2">

                      <Label htmlFor="custom-bg">背景</Label>

                      <Input

                        id="custom-bg"

                        type="color"

                        value={appearance.custom.backgroundHex}

                        onChange={(e) =>

                          void persist({

                            ...appearance,

                            custom: { ...appearance.custom, backgroundHex: e.target.value },

                          })

                        }

                        aria-label="选择背景色"

                      />

                    </div>

                    <div className="space-y-2">

                      <Label htmlFor="custom-fg">文字</Label>

                      <Input

                        id="custom-fg"

                        type="color"

                        value={appearance.custom.foregroundHex}

                        onChange={(e) =>

                          void persist({

                            ...appearance,

                            custom: { ...appearance.custom, foregroundHex: e.target.value },

                          })

                        }

                        aria-label="选择文字色"

                      />

                    </div>

                    <div className="space-y-2">

                      <Label htmlFor="custom-primary">主色</Label>

                      <Input

                        id="custom-primary"

                        type="color"

                        value={appearance.custom.primaryHex}

                        onChange={(e) =>

                          void persist({

                            ...appearance,

                            custom: { ...appearance.custom, primaryHex: e.target.value },

                          })

                        }

                        aria-label="选择主色"

                      />

                    </div>

                  </div>

                </div>

              ) : null}



              <AppearanceSlider

                label="圆角程度"

                displayValue={`${appearance.radiusRem.toFixed(2)}rem`}

                value={appearance.radiusRem}

                min={0}

                max={1.25}

                step={0.05}

                onValueChange={(v) => void persist({ ...appearance, radiusRem: v })}

              />



              <AppearanceSlider

                label="字体大小"

                displayValue={`${Math.round(appearance.fontScale * 100)}%`}

                value={appearance.fontScale}

                min={0.9}

                max={1.25}

                step={0.01}

                onValueChange={(v) => void persist({ ...appearance, fontScale: v })}

              />



              <div className="space-y-2">

                <Label>字体选择</Label>

                <Select

                  value={appearance.font}

                  onValueChange={(v) =>

                    void persist({ ...appearance, font: v as FontChoice })

                  }

                >

                  <SelectTrigger>

                    <SelectValue placeholder="选择字体" />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="dm_sans">DM Sans（默认）</SelectItem>

                    <SelectItem value="crimson_pro">Crimson Pro（衬线）</SelectItem>

                    <SelectItem value="system">系统字体</SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </AppearanceSection>



            <AppearanceSection

              title="卡片与材质"

              description="控制卡片层次、透明度和分类标签的表现。"

            >

              <SurfaceMaterialSelectField

                label="卡片材质"

                value={appearance.cardMaterial}

                onValueChange={(cardMaterial) =>

                  void persist({

                    ...appearance,

                    cardMaterial,

                  })

                }

              />



              <AppearanceSlider

                label="卡片透明度"

                displayValue={`${Math.round(appearance.cardOpacity * 100)}%`}

                value={Math.round(appearance.cardOpacity * 100)}

                min={0}

                max={100}

                step={1}

                onValueChange={(v) =>

                  void persist({

                    ...appearance,

                    cardOpacity: Math.min(1, Math.max(0, v / 100)),

                  })

                }

              />



              <AppearanceSlider

                label="分类标签透明度"

                displayValue={`${Math.round(appearance.categoryButtonOpacity * 100)}%`}

                value={Math.round(appearance.categoryButtonOpacity * 100)}

                min={0}

                max={100}

                step={1}

                onValueChange={(v) =>

                  void persist({

                    ...appearance,

                    categoryButtonOpacity: Math.min(1, Math.max(0, v / 100)),

                  })

                }

              />



              <AppearanceSwitchField

                label="卡片容器"

                description="控制分类内容外层容器是否显示。"

                checked={appearance.categoryContainerEnabled}

                onCheckedChange={(checked) =>

                  void persist({

                    ...appearance,

                    categoryContainerEnabled: checked,

                  })

                }

              />

            </AppearanceSection>



            <AppearanceSection

              title="顶栏与搜索栏"

              description="统一顶部导航与搜索区域的材质和透明度。"

            >

              <SurfaceMaterialSelectField

                label="顶栏材质"

                value={appearance.topNavMaterial}

                onValueChange={(topNavMaterial) =>

                  void persist({

                    ...appearance,

                    topNavMaterial,

                  })

                }

              />



              <AppearanceSlider

                label="顶栏透明度"

                displayValue={`${Math.round((appearance.topNavOpacity ?? 0.8) * 100)}%`}

                value={Math.round((appearance.topNavOpacity ?? 0.8) * 100)}

                min={0}

                max={100}

                step={1}

                onValueChange={(v) =>

                  void persist({

                    ...appearance,

                    topNavOpacity: Math.min(1, Math.max(0, v / 100)),

                  })

                }

              />



              <SurfaceMaterialSelectField

                label="搜索栏材质"

                value={appearance.searchBarMaterial}

                onValueChange={(searchBarMaterial) =>

                  void persist({

                    ...appearance,

                    searchBarMaterial,

                  })

                }

              />



              <AppearanceSlider

                label="搜索栏透明度"

                displayValue={`${Math.round((appearance.searchBarOpacity ?? 0.8) * 100)}%`}

                value={Math.round((appearance.searchBarOpacity ?? 0.8) * 100)}

                min={0}

                max={100}

                step={1}

                onValueChange={(v) =>

                  void persist({

                    ...appearance,

                    searchBarOpacity: Math.min(1, Math.max(0, v / 100)),

                  })

                }

              />

            </AppearanceSection>



            <AppearanceSection

              title="页面背景"

              description="设置页面背景图，或恢复默认外观。"

            >

              <div className="space-y-2">

                <div className="flex items-center justify-between gap-2">

                  <Label htmlFor={bgInputId}>页面背景图</Label>

                  {bgPreview ? (

                    <Button

                      variant="secondary"

                      size="sm"

                      onClick={removeBackground}

                    >

                      移除

                    </Button>

                  ) : null}

                </div>



                <div className="flex items-center gap-2">

                  <div className="min-w-0 flex-1">

                    {bgPreview ? (

                      <img

                        src={bgPreview}

                        alt="当前背景"

                        loading="lazy"

                        className="h-20 w-full rounded-md border object-cover"

                      />

                    ) : (

                      <div className="flex h-20 items-center justify-center rounded-md border bg-card text-xs text-muted-foreground">

                        未设置

                      </div>

                    )}

                  </div>

                  <Button

                    type="button"

                    variant="secondary"

                    size="sm"

                    onClick={openBackgroundPicker}

                  >

                    选择图片

                  </Button>

                </div>



                <Input

                  ref={bgInputRef}

                  id={bgInputId}

                  type="file"

                  accept="image/*"

                  className="hidden"

                  onChange={(e) => {

                    handleBackgroundFileChange(e.target.files?.[0] ?? null);

                    e.target.value = "";

                  }}

                />

              </div>



              <div className="flex flex-wrap items-center gap-2 pt-1">

                <Button

                  variant="secondary"

                  onClick={resetAppearance}

                >

                  恢复默认外观

                </Button>

              </div>

            </AppearanceSection>

          </div>

        </AccordionContent>

      </Card>

    </AccordionItem>

  );

}

