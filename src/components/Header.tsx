interface HeaderProps {
  logoSrc: string;
}

const Header = ({ logoSrc }: HeaderProps) => {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logoSrc} alt="Truco App Logo" className="header-logo" />
        <h1>Torneos de Truco</h1>
      </div>
    </header>
  );
};

export default Header;
