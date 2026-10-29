type Placement="header"|"footer";
export default function XSocialLink({placement="header"}:{placement?:Placement}){
 return <a
   className={"gravity-x-social gravity-x-social-"+placement}
   href="https://x.com/gravitydottrade"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="Gravity on X, @gravitydottrade"
   title="Follow @gravitydottrade on X"
  >
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.801-7.584-6.635 7.584H.477l8.6-9.832L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.492h2.04L6.486 3.24H4.298l13.313 17.405Z"/>
    </svg>
    <span>@gravitydottrade</span>
  </a>;
}
