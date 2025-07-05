
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
import { AlertCircle, FileUp, DatabaseZap, ShieldAlert } from "lucide-react";

type ImportResolution = 'skip' | 'overwrite' | 'cancel' | 'overwrite-all';

type ImportConfirmationDialogProps = {
  isOpen: boolean;
  onConfirm: (resolution: ImportResolution) => void;
  conflictsCount?: number;
  newCount?: number;
  isFullBackup?: boolean;
};

export const ImportConfirmationDialog = ({ 
  isOpen, 
  onConfirm,
  conflictsCount = 0,
  newCount = 0,
  isFullBackup = false
}: ImportConfirmationDialogProps) => {

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onConfirm('cancel');
    }
  };

  if (isFullBackup) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="text-destructive" />
              Restore from Backup?
            </DialogTitle>
            <DialogDescription>
              This action will completely <strong>overwrite your current library</strong> with the data from the backup file. This cannot be undone. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <Button variant="outline" onClick={() => onConfirm('cancel')}>
                  Cancel
              </Button>
              <Button variant="destructive" onClick={() => onConfirm('overwrite-all')}>
                  <DatabaseZap className="mr-2" /> Yes, Overwrite All
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                Overwriting will replace your existing data for conflicting titles with the data from the import file. Skipping will only add new, non-conflicting titles.
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
