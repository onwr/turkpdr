import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { testFaqItems } from "@/lib/mock-data/tests";

export function TestFaq() {
  return (
    <section
      aria-labelledby="test-faq-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8"
    >
      <div className="mb-6">
        <h2
          id="test-faq-heading"
          className="text-2xl font-bold tracking-tight text-brand-navy"
        >
          Sık Sorulan Sorular
        </h2>
        <p className="mt-2 text-muted-foreground">
          Test Merkezi hakkında merak edilenler
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {testFaqItems.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-base">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
