import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/8 bg-white/[0.03] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-3">
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Kintify</h3>
            <p className="text-sm text-slate-400">Cloud intelligence for modern infrastructure</p>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Social</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="https://x.com/CloudKintify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                X
              </Link>
              <Link
                href="https://reddit.com/user/KintifyCloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Reddit
              </Link>
              <Link
                href="https://linkedin.com/company/kintifycloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                LinkedIn
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Contact</h4>
            <div className="flex flex-col gap-2">
              <a href="mailto:Info@kintify.cloud" className="text-sm text-slate-400 hover:text-white transition-colors">
                Info@kintify.cloud
              </a>
              <a href="mailto:admin@kintify.cloud" className="text-sm text-slate-400 hover:text-white transition-colors">
                admin@kintify.cloud
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 border-t border-white/8 pt-8 text-center">
          <p className="text-xs text-slate-500">© 2026 Vintico. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
