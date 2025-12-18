// -------------------------------------------------------------
// Why: Provide global dark/light mode and accent color customization
// to improve UX and personalization.
// -------------------------------------------------------------
import React from 'react'

const ThemeContext = React.createContext()

export function ThemeProvider({ children }){
  const [dark, setDark] = React.useState(()=> localStorage.getItem('theme') === 'dark')
  const [accent, setAccent] = React.useState(()=> localStorage.getItem('accent') || 'blue')

  React.useEffect(()=>{
    const root = document.documentElement
    if (dark) root.classList.add('dark'); else root.classList.remove('dark')
    localStorage.setItem('theme', dark? 'dark':'light')
  }, [dark])


  React.useEffect(() => {
    // Map accent to real color value
    const accentMap = {
      blue: '#2563eb',
      purple: '#a78bfa',
      emerald: '#10b981',
      rose: '#f43f5e',
    };
    document.documentElement.style.setProperty('--accent-color', accentMap[accent] || accentMap.blue);
    localStorage.setItem('accent', accent);
  }, [accent])

  const value = { dark, setDark, accent, setAccent }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(){
  return React.useContext(ThemeContext)
}
