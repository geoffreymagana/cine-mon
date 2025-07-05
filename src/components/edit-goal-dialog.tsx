
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MovieService } from "@/lib/movie-service";
import { Loader2 } from "lucide-react";

type EditGoalDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentGoal: number;
  onGoalSet: (newGoal: number) => void;
};

export const EditGoalDialog = ({ isOpen, setIsOpen, currentGoal, onGoalSet }: EditGoalDialogProps) => {
  const [goal, setGoal] = React.useState(currentGoal);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setGoal(currentGoal);
    }
  }, [isOpen, currentGoal]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await MovieService.setSetting('watchGoal', goal);
      onGoalSet(goal);
      toast({
        title: "Goal Updated!",
        description: `Your watch goal is now set to ${goal} titles.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save watch goal:", error);
      toast({
        title: "Error",
        description: "Could not save your new watch goal.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Watch Goal</DialogTitle>
          <DialogDescription>
            How many titles do you aim to watch this year?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal-input" className="text-right">
              Goal
            </Label>
            <Input
              id="goal-input"
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              className="col-span-3"
              min="1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
