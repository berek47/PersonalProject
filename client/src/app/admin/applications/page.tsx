"use client";

import { useState, useEffect } from "react";
import { getInstructorApplications, approveApplication, rejectApplication } from "@/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  UserIcon,
  BriefcaseIcon,
  BookOpenIcon,
  LinkedinIcon,
  GlobeIcon,
  VideoIcon,
} from "lucide-react";
import { toast } from "sonner";

type Application = {
  id: string;
  status: string;
  expertise: string;
  experience: string;
  bio: string;
  courseTopic: string;
  sampleVideo: string | null;
  linkedin: string | null;
  website: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date;
  };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  async function fetchApplications() {
    setLoading(true);
    try {
      const data = await getInstructorApplications({ status: statusFilter, page });
      setApplications(data.applications as Application[]);
      setTotalPages(data.pages);
    } catch (error) {
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  async function handleApprove(applicationId: string) {
    try {
      await approveApplication(applicationId, approveNotes);
      toast.success("Application approved! User is now an instructor.");
      setDetailsOpen(false);
      setSelectedApp(null);
      setApproveNotes("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve application");
    }
  }

  async function handleReject() {
    if (!selectedApp || !rejectReason) return;

    try {
      await rejectApplication(selectedApp.id, rejectReason);
      toast.success("Application rejected");
      setRejectDialogOpen(false);
      setDetailsOpen(false);
      setSelectedApp(null);
      setRejectReason("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject application");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instructor Applications</h1>
        <p className="text-muted-foreground">Review and manage instructor applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
          <CardDescription>
            Click on an application to view details and take action
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-8 text-center">
              <ClockIcon className="mx-auto size-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  onClick={() => {
                    setSelectedApp(app);
                    setDetailsOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        {app.user.image ? (
                          <img src={app.user.image} alt={app.user.name} className="size-12 rounded-full" />
                        ) : (
                          <UserIcon className="size-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{app.user.name}</p>
                        <p className="text-sm text-muted-foreground">{app.user.email}</p>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          <span className="font-medium">Wants to teach:</span> {app.courseTopic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(app.status)}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Application from {selectedApp.user.name}
                  {getStatusBadge(selectedApp.status)}
                </DialogTitle>
                <DialogDescription>
                  Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    {selectedApp.user.image ? (
                      <img src={selectedApp.user.image} alt={selectedApp.user.name} className="size-16 rounded-full" />
                    ) : (
                      <UserIcon className="size-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedApp.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedApp.user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(selectedApp.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label className="flex items-center gap-2">
                    <UserIcon className="size-4" /> Bio
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedApp.bio}</p>
                </div>

                {/* Expertise */}
                <div>
                  <Label className="flex items-center gap-2">
                    <BriefcaseIcon className="size-4" /> Areas of Expertise
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedApp.expertise}</p>
                </div>

                {/* Experience */}
                <div>
                  <Label className="flex items-center gap-2">
                    <BriefcaseIcon className="size-4" /> Teaching/Professional Experience
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedApp.experience}</p>
                </div>

                {/* Course Topic */}
                <div>
                  <Label className="flex items-center gap-2">
                    <BookOpenIcon className="size-4" /> Proposed Course Topic
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedApp.courseTopic}</p>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {selectedApp.sampleVideo && (
                    <a
                      href={selectedApp.sampleVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <VideoIcon className="size-4" /> Sample Video
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                  {selectedApp.linkedin && (
                    <a
                      href={selectedApp.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <LinkedinIcon className="size-4" /> LinkedIn
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                  {selectedApp.website && (
                    <a
                      href={selectedApp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <GlobeIcon className="size-4" /> Website
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  )}
                </div>

                {/* Review Notes (if already reviewed) */}
                {selectedApp.reviewNotes && (
                  <div className="rounded-lg bg-muted p-4">
                    <Label>Review Notes</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedApp.reviewNotes}</p>
                    {selectedApp.reviewedAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Reviewed on {new Date(selectedApp.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Approve Notes (for pending applications) */}
                {selectedApp.status === "PENDING" && (
                  <div>
                    <Label htmlFor="approveNotes">Notes (optional)</Label>
                    <Textarea
                      id="approveNotes"
                      placeholder="Add any notes for this application..."
                      value={approveNotes}
                      onChange={(e) => setApproveNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {selectedApp.status === "PENDING" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectDialogOpen(true);
                    }}
                  >
                    <XCircleIcon className="mr-2 size-4" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedApp.id)}>
                    <CheckCircleIcon className="mr-2 size-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason for rejection</Label>
              <Textarea
                id="rejectReason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
