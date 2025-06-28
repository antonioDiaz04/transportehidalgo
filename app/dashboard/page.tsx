"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="flex flex-col bg-[#f7fafc]   items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="">
        <Image
          src="https://res.cloudinary.com/dvvhnrvav/image/upload/v1749563496/transporte/oekxnggselolp5paxtev.jpg"
          alt="Bienvenida al sistema"
          width={500}
          height={300}
          className="rounded-lg"
        />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Bienvenido al Sistema</h2>
        <p className="text-muted-foreground text-lg">
          Seleccione una opción del menú para comenzar
        </p>
      </div>

      <Button variant="outline" className="mt-4">
        Comenzar
      </Button>
    </div>
  );
}