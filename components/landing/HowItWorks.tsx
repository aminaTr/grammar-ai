"use client";

const HowItWorks = () => {
  return (
    <section id="HowItWorks" className="bg-background/50 py-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
        {/* Text content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight pb-6">
            How It Works
          </h1>
          <ol className="text-sm text-muted-foreground justify-center leading-relaxed space-x-2 list-decimal list-inside">
            <li>
              <strong>Sign In:</strong> You need to sign in or create an account
              to use Grammar AI.
            </li>
            <li>
              <strong>Enter Text:</strong> Type or paste your text into the
              editor for analysis.
            </li>
            <li>
              <strong>Receive Suggestions:</strong> Grammar AI highlights
              grammar, spelling, and punctuation issues. Hover over underlined
              words to see suggestions.
            </li>
            <li>
              <strong>Accept or Reject:</strong> You can choose which
              corrections to apply. The text updates automatically.
            </li>
            <li>
              <strong>Copy Text:</strong> Once satisfied, copy the corrected
              text or continue editing.
            </li>
          </ol>
        </div>

        {/* Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img
            src="/tool.png"
            alt="How It Works"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
