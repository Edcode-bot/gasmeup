'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
        >
          <button
            onClick={() => toggle(index)}
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <span className="font-semibold text-foreground">{item.question}</span>
            <ChevronDown
              className={`h-5 w-5 text-zinc-600 transition-transform dark:text-zinc-400 ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
