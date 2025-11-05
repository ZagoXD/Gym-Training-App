import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  CountryCode as PhoneCountryCode,
} from 'libphonenumber-js';
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import CountryPicker, { Country, CountryCode as Iso2CountryCode } from 'react-native-country-picker-modal';

export type PhoneFieldHandle = { getE164: () => string };

type Props = {
  defaultCountry?: Iso2CountryCode;
  initialE164?: string;
  onChangeE164?: (e164: string) => void;
  placeholder?: string;
};

const PhoneField = forwardRef<PhoneFieldHandle, Props>(
  ({ defaultCountry = 'BR', initialE164, onChangeE164, placeholder = 'Telefone' }, ref) => {
    const isDark = useColorScheme() === 'dark';

    const [country, setCountry] = useState<Iso2CountryCode>(defaultCountry);
    const [callingCode, setCallingCode] = useState<string>(getCountryCallingCode(defaultCountry as any));
    const [pretty, setPretty] = useState<string>('');
    const [hydrated, setHydrated] = useState(false);

    const inputRef = useRef<TextInput>(null);
    const lastE164Ref = useRef<string>('');

    useEffect(() => {
      try {
        const cc = getCountryCallingCode(country as any);
        setCallingCode(cc);
      } catch { /* noop */ }
    }, [country]);

    useImperativeHandle(ref, () => ({
      getE164: () => {
        const cc = (() => {
          try { return getCountryCallingCode(country as any); } catch { return callingCode; }
        })();

        const digits = pretty.replace(/\D/g, '');
        const probe = `+${cc}${digits}`;
        const parsed = parsePhoneNumberFromString(probe);

        if (parsed?.isValid()) {
          const e164 = parsed.format('E.164');
          lastE164Ref.current = e164;
          return e164;
        }
        return lastE164Ref.current || '';
      },
    }));

    function formatLocal(digitsOnly: string) {
      const fmt = new AsYouType(country as unknown as PhoneCountryCode);
      return fmt.input(digitsOnly);
    }

    function emitE164(prettyLocal: string) {
      const cc = (() => {
        try { return getCountryCallingCode(country as any); } catch { return callingCode; }
      })();
      const digits = prettyLocal.replace(/\D/g, '');
      const probe = `+${cc}${digits}`;
      const parsed = parsePhoneNumberFromString(probe);

      const e164 = parsed?.isValid() ? parsed.format('E.164') : '';
      if (e164) lastE164Ref.current = e164;
      onChangeE164?.(e164);
    }

    useEffect(() => {
      if (!initialE164 || hydrated) return;
      const parsed = parsePhoneNumberFromString(initialE164);
      if (parsed?.country) {
        setCountry(parsed.country as Iso2CountryCode);
        const fmt = new AsYouType(parsed.country as any);
        const prettyLocal = fmt.input(parsed.nationalNumber || '');
        setPretty(prettyLocal);
        onChangeE164?.(parsed.format('E.164'));
      }
      setHydrated(true);
    }, [initialE164, hydrated, onChangeE164]);

    const borderColor = useMemo(() => (isDark ? '#555' : '#ccc'), [isDark]);

    return (
      <View style={styles.wrap}>
        <View style={[styles.container, { borderColor, backgroundColor: isDark ? '#0b0b0b' : '#fff' }]}>
          <View style={styles.flagBox}>
            <CountryPicker
              countryCode={country}
              withFilter
              withEmoji
              withCallingCode
              withFlag
              onSelect={(c: Country) => {
                setCountry(c.cca2 as Iso2CountryCode);
                setPretty(prev => {
                  const next = formatLocal(prev.replace(/\D/g, ''));
                  setTimeout(() => emitE164(next), 0);
                  return next;
                });
              }}
            />
            <Text style={[styles.ccText, { color: isDark ? '#fff' : '#000' }]}>+{callingCode}</Text>
          </View>

          <TextInput
            ref={inputRef}
            value={pretty}
            onChangeText={(txt) => {
              const raw = txt.trim();
              if (raw.startsWith('+')) {
                const parsed = parsePhoneNumberFromString(raw);
                if (parsed?.country) {
                  setCountry(parsed.country as Iso2CountryCode);
                  const fmt = new AsYouType(parsed.country as any);
                  const prettyLocal = fmt.input(parsed.nationalNumber || '');
                  setPretty(prettyLocal);
                  const e164 = parsed.format('E.164');
                  lastE164Ref.current = e164;
                  onChangeE164?.(e164);
                  return;
                }
              }
              const digits = raw.replace(/\D/g, '');
              if (digits.length >= 6) {
                const guess = parsePhoneNumberFromString('+' + digits);
                if (guess?.country) {
                  if (guess.country !== country) setCountry(guess.country as Iso2CountryCode);
                  const fmt = new AsYouType(guess.country as any);
                  const prettyLocal = fmt.input(guess.nationalNumber || '');
                  setPretty(prettyLocal);
                  const e164 = guess.isValid() ? guess.format('E.164') : '';
                  if (e164) lastE164Ref.current = e164;
                  onChangeE164?.(e164);
                  return;
                }
              }
              const next = formatLocal(digits);
              setPretty(next);
              emitE164(next);
            }}
            placeholder={placeholder}
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            {...(Platform.OS === 'web' ? { inputMode: 'numeric' as any } : {})}
            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          />

        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  container: { width: '100%', borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  flagBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 6 },
  ccText: { fontSize: 16, fontWeight: '500' },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 16 },
});

export default PhoneField;
