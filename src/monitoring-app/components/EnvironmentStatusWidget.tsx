import { ArrowRight } from 'lucide-react';

interface MonitoringWidgetBrand {
  surfaceColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  successColor: string;
  warningColor: string;
}

const DEFAULT_BRAND: MonitoringWidgetBrand = {
  surfaceColor: '#111827',
  borderColor: '#1f2937',
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  successColor: '#10b981',
  warningColor: '#eab308',
};

export default function EnvironmentStatusWidget({ setCurrentPage, brand = DEFAULT_BRAND }: { setCurrentPage?: (page: string) => void; brand?: MonitoringWidgetBrand }) {
  const zoneSurface = `${brand.borderColor}4D`;

  return (
    <div className="rounded-lg border p-5 flex flex-col h-full" style={{ backgroundColor: brand.surfaceColor, borderColor: brand.borderColor }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: brand.textStrongColor }}>환경 진단</h3>
      <div className="flex flex-1 gap-4 mb-2">
         {/* Key Indicators */}
         <div className="w-1/2 flex flex-col">
            <div className="text-xs mb-2" style={{ color: brand.textSoftColor }}>주요 지표</div>
            <table className="w-full text-xs">
              <tbody>
                <tr style={{ borderTop: `1px solid ${brand.borderColor}80`, borderBottom: `1px solid ${brand.borderColor}80` }}>
                  <td className="py-2.5" style={{ color: brand.textColor }}>SO2</td>
                  <td className="py-2.5 text-right"><span className="font-bold" style={{ color: brand.warningColor }}>28</span> <span className="text-[10px]" style={{ color: brand.textSoftColor }}>ppm</span></td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${brand.borderColor}80` }}>
                  <td className="py-2.5" style={{ color: brand.textColor }}>NOx</td>
                  <td className="py-2.5 text-right"><span className="font-bold" style={{ color: brand.warningColor }}>32</span> <span className="text-[10px]" style={{ color: brand.textSoftColor }}>ppm</span></td>
                </tr>
                <tr style={{ borderBottom: `1px solid ${brand.borderColor}80` }}>
                  <td className="py-2.5" style={{ color: brand.textColor }}>먼지</td>
                  <td className="py-2.5 text-right"><span className="font-bold" style={{ color: brand.successColor }}>18</span> <span className="text-[10px]" style={{ color: brand.textSoftColor }}>µg/m³</span></td>
                </tr>
                <tr>
                  <td className="py-2.5" style={{ color: brand.textColor }}>온도</td>
                  <td className="py-2.5 text-right"><span className="font-bold" style={{ color: brand.textStrongColor }}>26.5</span> <span className="text-[10px]" style={{ color: brand.textSoftColor }}>°C</span></td>
                </tr>
              </tbody>
            </table>
         </div>
         {/* Zones */}
         <div className="w-1/2 flex flex-col border-l pl-4" style={{ borderColor: `${brand.borderColor}80` }}>
            <div className="text-xs mb-2" style={{ color: brand.textSoftColor }}>구역별 상태</div>
            <div className="grid grid-cols-2 gap-2 h-full gap-y-3 pt-2 content-start">
               {/* Zone A */}
               <div className="flex flex-col items-center justify-center p-2 rounded gap-1.5 border border-transparent min-w-[50px]" style={{ backgroundColor: zoneSurface }}>
                  <div className="text-[10px]" style={{ color: brand.textColor }}>A구역</div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.successColor, boxShadow: `0 0 8px ${brand.successColor}80` }} />
                  <div className="text-[10px]" style={{ color: brand.successColor }}>정상</div>
               </div>
               {/* Zone B */}
               <div className="flex flex-col items-center justify-center p-2 rounded gap-1.5 border col-span-1" style={{ backgroundColor: zoneSurface, borderColor: `${brand.warningColor}33` }}>
                  <div className="text-[10px]" style={{ color: brand.textColor }}>B구역</div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.warningColor, boxShadow: `0 0 8px ${brand.warningColor}80` }} />
                  <div className="text-[10px]" style={{ color: brand.warningColor }}>주의</div>
               </div>
               {/* Zone C */}
               <div className="flex flex-col items-center justify-center p-2 rounded gap-1.5 border border-transparent col-span-2 mx-auto w-16" style={{ backgroundColor: zoneSurface }}>
                  <div className="text-[10px]" style={{ color: brand.textColor }}>C구역</div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.successColor, boxShadow: `0 0 8px ${brand.successColor}80` }} />
                  <div className="text-[10px]" style={{ color: brand.successColor }}>정상</div>
               </div>
            </div>
         </div>
      </div>
      <button onClick={() => setCurrentPage?.('환경 진단')} className="flex justify-end items-center gap-1 text-[11px] transition-colors mt-auto pt-2" style={{ color: brand.textSoftColor }}>
        상세 보기 <ArrowRight size={10}/>
      </button>
    </div>
  );
}
