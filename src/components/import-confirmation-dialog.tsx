
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
import { AlertCircle, FileUp, DatabaseZap, XCircle } from "lucide-react";

type ImportResolution = 'skip' | 'overwrite' | 'cancel';

type ImportConfirmationDialogProps = {
  isOpen: boolean;
  conflictsCount: number;
  newCount: number;
  onConfirm: (resolution: ImportResolution) => void;
};

export const ImportConfirmationDialog = ({ 
  isOpen, 
  conflictsCount, 
  newCount,
  onConfirm 
}: ImportConfirmationDialogProps) => {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onConfirm('cancel')}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-amber-500" />
            Import Conflict
          </DialogTitle>
          <DialogDescription>
            Your import file contains {conflictsCount} title(s) that already exist in your collection, along with {newCount} new title(s). How would you like to proceed?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
                Overwriting will replace your existing data for conflicting titles with the data from the import file.
            </p>
        </div>
        <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => onConfirm('skip')}>
                <FileUp className="mr-2" /> Skip Duplicates
            </Button>
            <Button onClick={() => onConfirm('overwrite')}>
                <DatabaseZap className="mr-2" /> Overwrite Existing
            </Button>
            <Button variant="ghost" className="sm:col-span-2" onClick={() => onConfirm('cancel')}>
                Cancel Import
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
