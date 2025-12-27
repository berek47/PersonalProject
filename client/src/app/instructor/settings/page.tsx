"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  UserIcon,
  BellIcon,
  CreditCardIcon,
  ShieldIcon,
  SaveIcon,
  LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function InstructorSettingsPage() {
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  // Notification settings
  const [emailOnEnrollment, setEmailOnEnrollment] = useState(true);
  const [emailOnReview, setEmailOnReview] = useState(true);
  const [emailOnQuestion, setEmailOnQuestion] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Privacy settings
  const [showEmail, setShowEmail] = useState(false);
  const [showStudentCount, setShowStudentCount] = useState(true);

  async function handleSave() {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Settings saved successfully");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your instructor profile and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              Instructor Profile
            </CardTitle>
            <CardDescription>
              Information displayed on your public instructor profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="How students will see your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell students about yourself and your expertise..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                This will be displayed on your course pages
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="size-5" />
              Social Links
            </CardTitle>
            <CardDescription>
              Connect your social profiles (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                type="url"
                placeholder="https://twitter.com/yourhandle"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellIcon className="size-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Enrollment</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone enrolls in your course
                </p>
              </div>
              <Switch
                checked={emailOnEnrollment}
                onCheckedChange={setEmailOnEnrollment}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Review</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone leaves a review
                </p>
              </div>
              <Switch
                checked={emailOnReview}
                onCheckedChange={setEmailOnReview}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Student Questions</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when students ask questions
                </p>
              </div>
              <Switch
                checked={emailOnQuestion}
                onCheckedChange={setEmailOnQuestion}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your course performance
                </p>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldIcon className="size-5" />
              Privacy
            </CardTitle>
            <CardDescription>
              Control what information is visible to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email on your instructor profile
                </p>
              </div>
              <Switch
                checked={showEmail}
                onCheckedChange={setShowEmail}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Student Count</Label>
                <p className="text-sm text-muted-foreground">
                  Display total number of students on your courses
                </p>
              </div>
              <Switch
                checked={showStudentCount}
                onCheckedChange={setShowStudentCount}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="size-5" />
              Payout Settings
            </CardTitle>
            <CardDescription>
              Configure how you receive your earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Payout configuration is coming soon. For now, earnings are processed manually.
              Contact support for more information.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <SaveIcon className="mr-2 size-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
