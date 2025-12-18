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

  React.useEffect(()=>{
    document.documentElement.style.setProperty('--accent', accent)
    localStorage.setItem('accent', accent)
  }, [accent])

  const value = { dark, setDark, accent, setAccent }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(){
  return React.useContext(ThemeContext)
}
