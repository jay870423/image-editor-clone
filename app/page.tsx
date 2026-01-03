"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Upload, ArrowRight, Sparkles, Users, Zap, ImageIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generatedText, setGeneratedText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image is too large (max 10MB)")
        e.target.value = ""
        return
      }

      setError(null)
      setSelectedFile(file)
      setGeneratedImages([])
      setGeneratedText("")
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
      e.target.value = ""
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please add an image first")
      return
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("image", selectedFile)

      const res = await fetch("/api/generate", { method: "POST", body: formData })
      const data = (await res.json().catch(() => null)) as
        | { images?: string[]; text?: string; error?: string }
        | null

      if (!res.ok) {
        throw new Error(data?.error || "Generation failed")
      }

      const images = data?.images ?? []
      setGeneratedImages(images)
      setGeneratedText(data?.text ?? "")

      if (!images.length) {
        setError("No image returned by the model. Try a different prompt.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Banner */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 text-center relative overflow-hidden">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🍌</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">🍌</div>
        <p className="text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Nano Banana Pro is now live - Try it now
            <ArrowRight className="w-4 h-4" />
          </span>
        </p>
      </div>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <span>🍌</span>
            <span className="text-foreground">Nano Banana</span>
          </div>
          <Button variant="default">Start Editing</Button>
        </div>
      </nav>

      {/* Decorative banana elements */}
      <div className="absolute top-32 right-8 text-6xl opacity-10 rotate-12 pointer-events-none">🍌</div>
      <div className="absolute top-96 left-12 text-4xl opacity-10 -rotate-12 pointer-events-none">🍌</div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span>🍌</span>
          <span>The AI model that outperforms Flux Kontext</span>
          <Button variant="link" size="sm" className="p-0 h-auto text-accent-foreground">
            Try Now →
          </Button>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance">Nano Banana</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 text-pretty">
          Transform any image with simple text prompts. Nano-banana's advanced model delivers consistent character
          editing and scene preservation that surpasses Flux Kontext. Experience the future of AI image editing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2">
            <span>Start Editing</span>
            <span>🍌</span>
          </Button>
          <Button size="lg" variant="outline">
            View Examples
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto text-sm">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>One-shot editing</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            <span>Multi-image support</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Natural language</span>
          </div>
        </div>
      </section>

      {/* Editor Section */}
      <section className="container mx-auto px-4 py-20" id="generator">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get Started</h2>
          <p className="text-lg text-muted-foreground">Try The AI Editor</p>
          <p className="text-sm text-muted-foreground mt-2">
            Experience the power of nano-banana's natural language image editing. Transform any photo with simple text
            commands
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Section */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Prompt Engine
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Transform your image with AI-powered editing</p>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Reference Image</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {selectedImage ? (
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Uploaded"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">Add Image</p>
                          <p className="text-xs text-muted-foreground">Max 10MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Main Prompt</label>
                <Textarea
                  placeholder="Describe your desired edits... e.g., 'place the subject in a snowy mountain landscape'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32"
                />
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating || !selectedFile || !prompt.trim()}
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-5" />
                    Generating...
                  </span>
                ) : (
                  "Generate Now"
                )}
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </Card>

          {/* Output Section */}
          <Card className="p-6 bg-muted/50">
            <h3 className="text-xl font-semibold mb-4">Output Gallery</h3>
            <p className="text-sm text-muted-foreground mb-6">Your ultra-fast AI creations appear here instantly</p>

            <div className="h-96 border-2 border-dashed border-border rounded-lg bg-background overflow-hidden">
              {isGenerating ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner className="size-5" />
                      <span>Generating...</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Sending your image + prompt to Nano Banana</p>
                  </div>
                </div>
              ) : generatedImages.length || generatedText ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 h-full overflow-auto">
                  {generatedImages.map((src, idx) => (
                    <a
                      key={`${idx}-${src.slice(0, 32)}`}
                      href={src}
                      download={`nano-banana-${idx + 1}.png`}
                      className="group block rounded-lg overflow-hidden border bg-muted/30"
                      title="Click to download"
                    >
                      <img src={src} alt={`Generated ${idx + 1}`} className="w-full h-48 object-cover" />
                      <div className="p-2 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Click to download
                      </div>
                    </a>
                  ))}
                  {generatedText ? (
                    <div className="sm:col-span-2 text-sm text-muted-foreground whitespace-pre-wrap border rounded-lg p-3">
                      {generatedText}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">Ready for instant generation</p>
                    <p className="text-sm text-muted-foreground mt-2">Enter your prompt and unleash the power</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Features</h2>
            <p className="text-lg text-muted-foreground">Why Choose Nano Banana?</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
              Nano-banana is the most advanced AI image editor on LMArena. Revolutionize your photo editing with natural
              language understanding
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Natural Language Editing</h3>
              <p className="text-muted-foreground text-sm">
                Edit images using simple text prompts. Nano-banana AI understands complex instructions like GPT for
                images
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Character Consistency</h3>
              <p className="text-muted-foreground text-sm">
                Maintain perfect character details across edits. This model excels at preserving faces and identities
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scene Preservation</h3>
              <p className="text-muted-foreground text-sm">
                Seamlessly blend edits with original backgrounds. Superior scene fusion compared to Flux Kontext
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">One-Shot Editing</h3>
              <p className="text-muted-foreground text-sm">
                Perfect results in a single attempt. Nano-banana solves one-shot image editing challenges effortlessly
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Image Context</h3>
              <p className="text-muted-foreground text-sm">
                Process multiple images simultaneously. Support for advanced multi-image editing workflows
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI UGC Creation</h3>
              <p className="text-muted-foreground text-sm">
                Create consistent AI influencers and UGC content. Perfect for social media and marketing campaigns
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="container mx-auto px-4 py-20" id="showcase">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Showcase</h2>
          <p className="text-lg text-muted-foreground">Lightning-Fast AI Creations</p>
          <p className="text-sm text-muted-foreground mt-2">See what Nano Banana generates in milliseconds</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card className="overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <img src="/sunset-mountain-landscape.png" alt="Mountain landscape" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-3">
                Nano Banana Speed
              </div>
              <h3 className="text-xl font-semibold mb-2">Ultra-Fast Mountain Generation</h3>
              <p className="text-sm text-muted-foreground">
                Created in 0.8 seconds with Nano Banana's optimized neural engine
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-green-500 to-teal-600 relative">
              <img src="/beautiful-garden-with-flowers.jpg" alt="Garden scene" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="inline-block bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full mb-3">
                Nano Banana Speed
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Garden Creation</h3>
              <p className="text-sm text-muted-foreground">
                Complex scene rendered in milliseconds using Nano Banana technology
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-orange-500 to-pink-600 relative">
              <img src="/tropical-beach-sunset.png" alt="Beach scene" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full mb-3">
                Nano Banana Speed
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Beach Synthesis</h3>
              <p className="text-sm text-muted-foreground">
                Nano Banana delivers photorealistic results at lightning speed
              </p>
            </div>
          </Card>

          <Card className="overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-indigo-600 relative">
              <img src="/images/northern-lights.png" alt="Aurora scene" className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <div className="inline-block bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full mb-3">
                Nano Banana Speed
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapid Aurora Generation</h3>
              <p className="text-sm text-muted-foreground">Advanced effects processed instantly with Nano Banana AI</p>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Experience the power of Nano Banana yourself</p>
          <Button size="lg" variant="outline">
            Try Nano Banana Generator
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">User Reviews</h2>
            <p className="text-lg text-muted-foreground">What creators are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  AP
                </div>
                <div>
                  <p className="font-semibold">AIArtistPro</p>
                  <p className="text-sm text-muted-foreground">Digital Creator</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "This editor completely changed my workflow. The character consistency is incredible - miles ahead of
                Flux Kontext!"
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  CC
                </div>
                <div>
                  <p className="font-semibold">ContentCreator</p>
                  <p className="text-sm text-muted-foreground">UGC Specialist</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "Creating consistent AI influencers has never been easier. It maintains perfect face details across
                edits!"
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  PE
                </div>
                <div>
                  <p className="font-semibold">PhotoEditor</p>
                  <p className="text-sm text-muted-foreground">Professional Editor</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                "One-shot editing is basically solved with this tool. The scene blending is so natural and realistic!"
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">FAQs</h2>
          <p className="text-lg text-muted-foreground">Frequently Asked Questions</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">What is Nano Banana?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It's a revolutionary AI image editing model that transforms photos using natural language prompts. This
                is currently the most powerful image editing model available, with exceptional consistency. It offers
                superior performance compared to Flux Kontext for consistent character editing and scene preservation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">How does it work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Simply upload an image and describe your desired edits in natural language. The AI understands complex
                instructions like "place the creature in a snowy mountain" or "imagine the whole face and create it". It
                processes your text prompt and generates perfectly edited images.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                How is it better than Flux Kontext?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                This model excels in character consistency, scene blending, and one-shot editing. Users report it
                "completely destroys" Flux Kontext in preserving facial features and seamlessly integrating edits with
                backgrounds. It also supports multi-image context, making it ideal for creating consistent AI
                influencers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                Can I use it for commercial projects?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! It's perfect for creating AI UGC content, social media campaigns, and marketing materials. Many
                users leverage it for creating consistent AI influencers and product photography. The high-quality
                outputs are suitable for professional use.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">
                What types of edits can it handle?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The editor handles complex edits including face completion, background changes, object placement, style
                transfers, and character modifications. It excels at understanding contextual instructions like "place
                in a blizzard" or "create the whole face" while maintaining photorealistic quality.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold">Where can I try Nano Banana?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can try nano-banana on LMArena or through our web interface. Simply upload your image, enter a text
                prompt describing your desired edits, and watch as nano-banana AI transforms your photo with incredible
                accuracy and consistency.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-xl font-bold">
              <span>🍌</span>
              <span>Nano Banana</span>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 Nano Banana. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
