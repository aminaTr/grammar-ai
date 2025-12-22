import RequireAuth from "@/components/RequireAuth";
import GrammarCheck from "@/components/grammar/GrammarCheck";

const GrammarPage = () => {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-background py-24">
        <GrammarCheck />
      </div>
    </RequireAuth>
  );
};

export default GrammarPage;
