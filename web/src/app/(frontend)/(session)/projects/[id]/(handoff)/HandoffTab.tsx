// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Edit, FileText } from "lucide-react";
// import type { ProjectComplete } from "@/types";

// export default function HandoffTab({ project }: { project: ProjectComplete }) {
//   const doc = project.handoffDocument;

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>Ata de Handoff/Kickoff</CardTitle>

//         </CardHeader>

//         <CardContent>
//           {doc ? (
//             <div className="space-y-6">
//               <section>
//                 <h4 className="font-medium mb-2">Objetivos</h4>
//                 <p className="text-muted-foreground">{doc.objectives}</p>
//               </section>

//               <section>
//                 <h4 className="font-medium mb-2">Escopo</h4>
//                 <p className="text-muted-foreground">{doc.scope}</p>
//               </section>

//               <section>
//                 <h4 className="font-medium mb-2">Combinados com Cliente</h4>
//                 <p className="text-muted-foreground">{doc.clientAgreements}</p>
//               </section>

//               {doc.artifacts?.length > 0 && (
//                 <section>
//                   <h4 className="font-medium mb-2">Artefatos</h4>
//                   <ul className="list-disc list-inside text-muted-foreground space-y-1">
//                     {doc.artifacts.map((artifact, i) => <li key={i}>{artifact}</li>)}
//                   </ul>
//                 </section>
//               )}

//               {doc.risks?.length > 0 && (
//                 <section>
//                   <h4 className="font-medium mb-2">Riscos</h4>
//                   <ul className="list-disc list-inside text-muted-foreground space-y-1">
//                     {doc.risks.map((risk, i) => <li key={i}>{risk}</li>)}
//                   </ul>
//                 </section>
//               )}

//               {doc.stakeholders?.length > 0 && (
//                 <section>
//                   <h4 className="font-medium mb-2">Stakeholders</h4>
//                   <ul className="list-disc list-inside text-muted-foreground space-y-1">
//                     {doc.stakeholders.map((p, i) => <li key={i}>{p}</li>)}
//                   </ul>
//                 </section>
//               )}

//               <Button variant="outline" className="mt-2 cursor-pointer">
//                 <Edit className="h-4 w-4 mr-2" />
//                 Editar Documento
//               </Button>
//             </div>
//           ) : (
//             <div className="text-center py-8">
//               <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground mb-4">Nenhum documento de handoff criado</p>
//               <Button className="cursor-pointer" variant="hero">
//                 <Edit className="h-4 w-4 mr-2" />
//                 Criar Documento
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
