
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminGameTemplate() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Game Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            This page contains templates and examples for different game types in the Fire Safety Education Platform.
          </p>
          <p>Coming soon: A library of pre-made game templates that you can use as starting points.</p>
        </CardContent>
      </Card>
    </div>
  );
}
