/**
 * Copyright 2024-2025 NetCracker Technology Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// OIDCForm is the OpenID Connect section of the sign-in settings (spec.auth.oidc).
export interface OIDCForm {
  enabled: boolean
  displayName: string
  issuerUrl: string
  clientId: string
  clientSecret: string
  hasClientSecret: boolean
  redirectUrl: string
  scopes: string
  groupsClaim: string
  rolesClaim: string
  defaultRole: string
  autoProvision: boolean
  skipSslVerify: boolean
  mapping: { group: string; role: string }[]
  roleMapping: { name: string; role: string }[]
}

export const emptyOIDC: OIDCForm = {
  enabled: false, displayName: '', issuerUrl: '', clientId: '', clientSecret: '', hasClientSecret: false, redirectUrl: '',
  scopes: '', groupsClaim: '', rolesClaim: '', defaultRole: 'viewer', autoProvision: true, skipSslVerify: false, mapping: [], roleMapping: [],
}

// oidcRequest is what Settings sends for the form: the secret only when one was typed.
export function oidcRequest(f: OIDCForm) {
  return {
    enabled: f.enabled, displayName: f.displayName.trim(), issuerUrl: f.issuerUrl.trim(), clientId: f.clientId.trim(),
    redirectUrl: f.redirectUrl.trim(), scopes: f.scopes.split(/[\s,]+/).filter(Boolean), groupsClaim: f.groupsClaim.trim(),
    rolesClaim: f.rolesClaim.trim(), defaultRole: f.defaultRole, autoProvision: f.autoProvision, skipSslVerify: f.skipSslVerify,
    groupRoleMapping: Object.fromEntries(f.mapping.filter(m => m.group.trim()).map(m => [m.group.trim(), m.role])),
    roleMapping: Object.fromEntries(f.roleMapping.filter(m => m.name.trim()).map(m => [m.name.trim(), m.role])),
    ...(f.clientSecret ? { clientSecret: f.clientSecret } : {}),
  }
}

// oidcProblem says what the operator would refuse.
export function oidcProblem(f: OIDCForm): string | null {
  if (f.issuerUrl.trim() && !f.issuerUrl.trim().startsWith('https://')) return 'The issuer URL must be HTTPS: the client secret is sent to it.'
  if (f.enabled && (!f.issuerUrl.trim() || !f.clientId.trim())) return 'Issuer URL and client ID are required to enable single sign-on.'
  return null
}

// keycloak fills in what Keycloak sends: groups with the group membership mapper, realm
// roles in realm_access.roles.
export const keycloakDefaults = (f: OIDCForm): OIDCForm => ({
  ...f, displayName: f.displayName || 'Keycloak', groupsClaim: 'groups', rolesClaim: 'realm_access.roles', scopes: f.scopes || 'profile email',
})

