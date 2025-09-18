import NavbarLogo from "@/components/nav/NavbarLogo";
import CadastroForm from "./CadastroForm";

function Cadastro() {
  return ( 
    <>
      <nav className="w-full py-6 px-8 text-pink-500">
        <NavbarLogo />
      </nav>
      
      <CadastroForm />
    </>
   );
}

export default Cadastro;