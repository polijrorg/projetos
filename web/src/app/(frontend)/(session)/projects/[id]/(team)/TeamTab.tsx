"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { Project } from "@/types";

export default function TeamTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipe do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.analysts.map((analyst) => (
              <div key={analyst.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{analyst.name}</p>
                  <p className="text-sm text-muted-foreground">{analyst.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
