export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      products: {
        Row: {
          barcode: string
          name: string
          mrp: number | null
          sale_rate: number | null
          retail_rate: number | null
          restrate: number | null
          onlinerate: number | null
          online_rate: number | null
          selling_price: number | null
          cost_price: number | null
          purchase_rate: number | null
          purcrate: number | null
          delivery_rate: number | null
          dlvrate: number | null
          take_rate: number | null
          takerate: number | null
          stock: number | null
          opstock: number | null
          opening_stock: number | null
          category_name: string | null
          item_group_name: string | null
          item_group: string | null
          brand_name: string | null
          subcategory_name: string | null
          sub_category_name: string | null
          discount_percent: number | null
          discount_pct: number | null
          discperc: number | null
          discount: number | null
          discount_amount: number | null
          discount_type: string | null
          gst_percent: number | null
          gst_pct: number | null
          gst: number | null
          cess_percent: number | null
          cess_pct: number | null
          cess: number | null
          image_url: string | null
          picture: string | null
          imagename: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          is_favourite: boolean | null
          isfav: boolean | null
          is_discountable: boolean | null
          isdiscountable: boolean | null
          is_package: boolean | null
          ispackage: boolean | null
          unit_name: string | null
          unitcode: string | null
          description: string | null
          item_description: string | null
          itemdescription: string | null
          print_name: string | null
          itnameprint: string | null
          item_name: string | null
          itname: string | null
          brand_code: string | null
          brandcode: string | null
          brand_id: string | null
          category_code: string | null
          category_id: string | null
          sub_category_code: string | null
          subcategory_id: string | null
          company_code: string | null
          tenant_id: string | null
          shop_id: string | null
          shopid: string | null
          department_code: string | null
          dtcode: string | null
          hsn_code: string | null
          hsncode: string | null
          id: number | null
          item_status: string | null
          itemstatus: string | null
          low_stock_threshold: number | null
          max_discount: number | null
          min_selling_price: number | null
          narration: string | null
          narration2: string | null
          item_category: string | null
          itc: string | null
          itg: string | null
          kcode: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          barcode: string
          name: string
        }
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>
      }
      orders: {
        Row: {
          id: string
          order_id_str: string | null
          order_no: string | null
          order_number: string | null
          user_id: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          user_mobile: string | null
          items: Json | null
          subtotal: number | null
          discount: number | null
          coupon_discount: number | null
          delivery_charge: number | null
          packaging_charge: number | null
          cess_amount: number | null
          round_off: number | null
          cgst_amount: number | null
          sgst_amount: number | null
          igst_amount: number | null
          total: number | null
          total_amount: number | null
          shipping_address: string | null
          delivery_address: string | null
          landmark: string | null
          pincode: string | null
          payment_method: string | null
          payment_mode: string | null
          payment_status: string | null
          order_type: string | null
          order_status: string | null
          status: string | null
          source_ip: string | null
          notes: string | null
          invoice_generated: boolean | null
          invoice_printed_at: string | null
          cancelled_at: string | null
          delivered_at: string | null
          coupon_id: string | null
          is_deleted: boolean | null
          cashier_admin_user_id: string | null
          delivery_boy_id: string | null
          company_code: string | null
          tenant_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          mobile: string | null
          phone: string | null
          phone_number: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          landmark: string | null
          avatar_url: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>
      }
      categories: {
        Row: {
          id: string
          name: string
          image_url: string | null
          description: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          sort_order: number | null
          company_code: string | null
          tenant_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & { name: string }
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>
      }
      banners: {
        Row: {
          id: string
          name: string | null
          title: string | null
          description: string | null
          image_url: string | null
          link_url: string | null
          link_type: string | null
          link_id: string | null
          linked_product_id: string | null
          action_type: string | null
          action_value: string | null
          banner_type: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          sort_order: number | null
          itname: string | null
          start_date: string | null
          end_date: string | null
          company_code: string | null
          tenant_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["banners"]["Row"]>
        Update: Partial<Database["public"]["Tables"]["banners"]["Row"]>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
