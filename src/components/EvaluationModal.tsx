"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Loader } from "lucide-react";

interface EvaluationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (score: number, remarks: string) => void
}

export default function EvaluationModal({ isOpen, onClose, onSubmit }: EvaluationModalProps) {
  const [score, setScore] = useState('')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    setLoading(true)
    e.preventDefault()
    onSubmit(Number(score), remarks)
    setScore('')
    setRemarks('')
    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Evaluate Assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="score">Score</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Submit Evaluation"
              )}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

