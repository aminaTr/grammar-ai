import { BASE_PLANS, PAID_PLANS } from "@/lib/constants/plans";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExtendedUser } from "@/types/extendedUser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LockKeyhole } from "lucide-react";

const ModelSelect = ({
  selectedModel,
  setSelectedModel,
  user,
}: {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  user: ExtendedUser | null;
}) => {
  const freeModels = Object.values(BASE_PLANS).flatMap((plan) => plan.models);
  const paidModels = Object.values(PAID_PLANS).flatMap((plan) => plan.models);
  // Remove duplicates across free/premium
  const uniqueFree = Array.from(new Set(freeModels));
  const uniquePaid = Array.from(
    new Set(paidModels.filter((m) => !uniqueFree.includes(m)))
  );

  const canUseModel = (model: string) => {
    if (!user) return false;
    if (user.plan === "free") return false;
    return PAID_PLANS[user.plan].models.includes(model);
  };

  const requiredPlanForModel = (model: string) => {
    return Object.values(PAID_PLANS).find((plan) => plan.models.includes(model))
      ?.id;
  };

  return (
    <Select
      value={selectedModel}
      defaultValue={selectedModel}
      onValueChange={setSelectedModel}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Free</SelectLabel>
          {uniqueFree.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Paid</SelectLabel>
          <TooltipProvider>
            {uniquePaid.map((model) => {
              const allowed = canUseModel(model);
              const requiredPlan = requiredPlanForModel(model);

              const item = (
                <SelectItem
                  key={model}
                  value={model}
                  disabled={!allowed}
                  className={
                    !allowed
                      ? "cursor-not-allowed opacity-60 flex items-center gap-2"
                      : ""
                  }
                >
                  {model}
                  {!allowed && <LockKeyhole />}
                </SelectItem>
              );

              if (allowed) return item;

              return (
                <Tooltip key={model}>
                  <TooltipTrigger asChild>
                    <div>{item}</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Upgrade to <strong>{requiredPlan}</strong> plan to access
                    this model
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ModelSelect;
