
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminFormatGuide() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Content Format Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            This guide provides detailed information on formatting content for the Fire Safety Education Platform.
          </p>
          <p>Please refer to the specific game type documentation for format requirements.</p>
        </CardContent>
      </Card>
    </div>
  );
}
