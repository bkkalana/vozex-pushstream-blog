import { Search } from "lucide-react";

export function SearchBox({ name = "q", defaultValue = "", placeholder = "Search articles, tools, or topics...", action = "/search", label = "Search" }: { name?: string; defaultValue?: string; placeholder?: string; action?: string; label?: string }) {
  return <form className="ps-search-box" action={action} method="get" role="search"><label className="sr-only" htmlFor={`ps-search-${name}`}>{label}</label><Search size={18} aria-hidden="true"/><input id={`ps-search-${name}`} name={name} defaultValue={defaultValue} placeholder={placeholder}/><button type="submit" aria-label={label}><Search size={18} aria-hidden="true"/></button></form>;
}
